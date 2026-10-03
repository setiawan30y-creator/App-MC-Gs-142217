/**
 * MC-ALMARA TRANSACTION POSTING ENGINE
 * Flow:
 * Transaction -> Payment -> Settlement -> Cash/Bank -> Stock -> Journal -> Audit
 *
 * DRAFT/HOLD: data transaksi saja, tidak memutasi saldo.
 * PAID/SETTLED/COMPLETED: diposting satu kali secara idempotent.
 */

function postTransaction_(trx, items, payments, p){
  p=p||{};
  const lock=LockService.getScriptLock();
  lock.waitLock(30000);
  try{
    if(!trx || !trx.id) throw new Error('Transaksi tidak valid.');
    const status=String(trx.status||'').toUpperCase();
    if(['DRAFT','HOLD','CANCELLED','VOID'].indexOf(status)>=0){
      return {posted:false,reason:'STATUS_'+status};
    }

    const existing=rowsAsObjects_(getSS_().getSheetByName('46_settlements')).find(x=>String(x.transaction_id)===String(trx.id)&&String(x.status).toUpperCase()==='SETTLED');
    if(existing) return {posted:false,idempotent:true,settlement:existing};

    const session=getActiveOpening_(trx.branch_id,trx.created_at);
    if(!session) throw new Error('Sesi harian belum dibuka atau sudah ditutup. Buka Saldo Awal terlebih dahulu.');

    const normalizedPayments=normalizePayments_(payments,p);
    const total=Number(trx.grand_total||0);
    const paidTotal=normalizedPayments.reduce((s,x)=>s+x.amount,0);
    if(Math.abs(paidTotal-total)>0.005) throw new Error('Total payment tidak sama dengan grand total transaksi.');

    const paymentRows=[];
    normalizedPayments.forEach(pay=>{
      const paymentId=uuid_();
      appendObject_('44_transaction_payments',{
        id:paymentId,transaction_id:trx.id,method:pay.method,amount:pay.amount,
        status:'PAID',reference:pay.reference||'',proof_url:pay.proof_url||''
      });
      paymentRows.push({id:paymentId,payment:pay});
      const allocAccount=resolvePaymentAccount_(pay);
      appendObject_('45_payment_allocations',{
        id:uuid_(),payment_id:paymentId,account_type:allocAccount.type,account_id:allocAccount.id,amount:pay.amount
      });
    });

    const settlementId=uuid_();
    appendObject_('46_settlements',{
      id:settlementId,transaction_id:trx.id,total,status:'SETTLED',settled_at:iso_()
    });

    const cashIn=[],cashOut=[],bankIn=[],bankOut=[];
    normalizedPayments.forEach(pay=>{
      if(pay.method==='CASH'){
        const acc=resolveCashAccount_(pay.account_id,pay.currency||'IDR');
        appendObject_('61_cash_movements',{
          id:uuid_(),cash_account_id:acc.id,movement_type:'IN',
          amount:pay.amount,reference_type:'TRANSACTION',reference_id:trx.id,created_at:iso_()
        });
        cashIn.push(pay.amount);
      }else if(pay.method==='TRANSFER'){
        const acc=resolveBankAccount_(pay.account_id);
        appendObject_('63_bank_movements',{
          id:uuid_(),bank_account_id:acc.id,movement_type:'IN',
          amount:pay.amount,reference_type:'TRANSACTION',reference_id:trx.id,created_at:iso_()
        });
        bankIn.push(pay.amount);
      }
    });

    const stockEffects=postStockEffects_(trx,items);
    const journal=postJournal_(trx,normalizedPayments,stockEffects,settlementId);

    audit_('POST','TRANSACTION',trx.id,null,{
      settlement_id:settlementId,payments:normalizedPayments,stock_effects:stockEffects,journal_id:journal.id,session_id:session.opening.id
    });

    return {
      posted:true,
      settlement:{id:settlementId,total,status:'SETTLED'},
      payments:paymentRows,
      stock:stockEffects,
      journal,
      cash_in:cashIn.reduce((a,b)=>a+b,0),
      bank_in:bankIn.reduce((a,b)=>a+b,0)
    };
  }finally{
    lock.releaseLock();
  }
}

function normalizePayments_(payments,p){
  let src=Array.isArray(payments)?payments:[];
  if(!src.length && p.payment){
    const raw=String(p.payment).toUpperCase();
    src=[{method:raw.indexOf('TRANSFER')>=0?'TRANSFER':'CASH',amount:Number(p.total||0)}];
  }
  return src.map(x=>{
    const method=String(x.method||'CASH').toUpperCase();
    if(['CASH','TRANSFER'].indexOf(method)<0) throw new Error('Metode payment tidak didukung: '+method);
    return {
      method,
      amount:Number(String(x.amount||0).replace(/[^0-9.-]/g,'')),
      account_id:x.account_id||'',
      currency:String(x.currency||'IDR').toUpperCase(),
      reference:x.reference||'',
      proof_url:x.proof_url||''
    };
  }).filter(x=>x.amount>0);
}

function getActiveOpening_(branchId,createdAt){
  const date=String(createdAt||iso_()).slice(0,10);
  const rows=rowsAsObjects_(getSS_().getSheetByName('65_openings'));
  const opening=rows.find(x=>String(x.branch_id)===String(branchId||APP_CONFIG.DEFAULT_BRANCH_ID)&&String(x.date)===date&&String(x.status).toUpperCase()==='OPEN');
  if(!opening)return null;
  return {opening};
}

function resolvePaymentAccount_(pay){
  if(pay.method==='TRANSFER'){
    const a=resolveBankAccount_(pay.account_id);
    return {type:'BANK',id:a.id};
  }
  const a=resolveCashAccount_(pay.account_id,pay.currency||'IDR');
  return {type:'CASH',id:a.id};
}

function resolveCashAccount_(accountId,currency){
  const sh=getSS_().getSheetByName('60_cash_accounts');
  const rows=rowsAsObjects_(sh);
  let row=rows.find(x=>String(x.id)===String(accountId))||rows.find(x=>String(x.branch_id)===String(APP_CONFIG.DEFAULT_BRANCH_ID)&&String(x.currency).toUpperCase()===String(currency).toUpperCase()&&String(x.status||'ACTIVE').toUpperCase()!=='INACTIVE');
  if(!row){
    const id=uuid_();
    appendObject_('60_cash_accounts',{id,tenant_id:APP_CONFIG.DEFAULT_TENANT_ID,branch_id:APP_CONFIG.DEFAULT_BRANCH_ID,currency:String(currency||'IDR').toUpperCase(),account_name:'Kas '+String(currency||'IDR').toUpperCase(),balance:0,status:'ACTIVE'});
    row={id};
  }
  return row;
}

function resolveBankAccount_(accountId){
  const sh=getSS_().getSheetByName('62_bank_accounts');
  const rows=rowsAsObjects_(sh);
  let row=rows.find(x=>String(x.id)===String(accountId))||rows.find(x=>String(x.branch_id)===String(APP_CONFIG.DEFAULT_BRANCH_ID)&&String(x.status||'ACTIVE').toUpperCase()!=='INACTIVE');
  if(!row){
    const id=uuid_();
    appendObject_('62_bank_accounts',{id,tenant_id:APP_CONFIG.DEFAULT_TENANT_ID,branch_id:APP_CONFIG.DEFAULT_BRANCH_ID,bank_name:'UNSPECIFIED',account_no:'',account_name:'Bank Utama',balance:0,status:'ACTIVE'});
    row={id};
  }
  return row;
}

function postStockEffects_(trx,items){
  const effects=[];
  (items||[]).forEach(item=>{
    const side=String(item.side||'').toUpperCase();
    if(side!=='BUY'&&side!=='SELL')return;
    const qty=Number(item.qty||0);
    if(qty<=0||!item.currency_id)return;
    const movement=side==='BUY'?'IN':'OUT';
    const stock=findOrCreateStock_(trx.branch_id,item.currency_id,item.denomination);
    if(movement==='OUT'){
      const available=Number(stock.available_qty||0);
      if(available+0.0000001<qty) throw new Error('Stok '+item.currency_id+' '+item.denomination+' tidak mencukupi.');
      updateStockQty_(stock,-qty);
    }else updateStockQty_(stock,qty);
    appendObject_('51_stock_movements',{
      id:uuid_(),tenant_id:APP_CONFIG.DEFAULT_TENANT_ID,branch_id:trx.branch_id||APP_CONFIG.DEFAULT_BRANCH_ID,
      currency_id:item.currency_id,denomination:item.denomination,movement_type:movement,qty,
      reference_type:'TRANSACTION',reference_id:trx.id,created_at:iso_()
    });
    effects.push({currency_id:item.currency_id,denomination:item.denomination,side,movement,qty,amount:Number(item.amount||0)});
  });
  return effects;
}

function findOrCreateStock_(branchId,currencyId,denomination){
  const rows=rowsAsObjects_(getSS_().getSheetByName('50_stock'));
  let row=rows.find(x=>String(x.branch_id)===String(branchId||APP_CONFIG.DEFAULT_BRANCH_ID)&&String(x.currency_id)===String(currencyId)&&String(x.denomination)===String(denomination));
  if(!row){
    const id=uuid_();
    appendObject_('50_stock',{id,tenant_id:APP_CONFIG.DEFAULT_TENANT_ID,branch_id:branchId||APP_CONFIG.DEFAULT_BRANCH_ID,currency_id:currencyId,denomination:denomination||'',available_qty:0,reserved_qty:0,status:'ACTIVE'});
    row={id,available_qty:0,reserved_qty:0};
  }
  return row;
}

function updateStockQty_(stock,delta){
  const sh=getSS_().getSheetByName('50_stock');
  const data=sh.getDataRange().getValues();
  const h=data[0];
  const idCol=h.indexOf('id'), qtyCol=h.indexOf('available_qty');
  const idx=data.findIndex((r,i)=>i>0&&String(r[idCol])===String(stock.id));
  if(idx<1)throw new Error('Stock tidak ditemukan.');
  const next=Number(data[idx][qtyCol]||0)+Number(delta||0);
  if(next<-0.0000001)throw new Error('Saldo stok tidak boleh negatif.');
  sh.getRange(idx+1,qtyCol+1).setValue(next);
}

function postJournal_(trx,payments,stockEffects,settlementId){
  const total=Number(trx.grand_total||0);
  const journalId=uuid_(), journalNo=sequence_('JRN','JRN');
  const stockIn=stockEffects.filter(x=>x.movement==='IN').reduce((s,x)=>s+Number(x.amount||0),0);
  const stockOut=stockEffects.filter(x=>x.movement==='OUT').reduce((s,x)=>s+Number(x.amount||0),0);
  const payCash=payments.filter(x=>x.method==='CASH').reduce((s,x)=>s+x.amount,0);
  const payBank=payments.filter(x=>x.method==='TRANSFER').reduce((s,x)=>s+x.amount,0);

  const cashAcc=getOrCreateCoa_('1100','Kas');
  const bankAcc=getOrCreateCoa_('1110','Bank');
  const stockAcc=getOrCreateCoa_('1200','Stok Valuta Asing');
  const contraAcc=getOrCreateCoa_('4100','Pendapatan/Beban Transaksi Valas');

  const lines=[];
  if(payCash) lines.push({account_id:cashAcc.id,debit:payCash,credit:0,description:'Settlement cash'});
  if(payBank) lines.push({account_id:bankAcc.id,debit:payBank,credit:0,description:'Settlement transfer'});
  if(stockIn) lines.push({account_id:stockAcc.id,debit:stockIn,credit:0,description:'FX stock received'});
  if(stockOut) lines.push({account_id:stockAcc.id,debit:0,credit:stockOut,description:'FX stock issued'});
  const debit=lines.reduce((s,x)=>s+x.debit,0), credit=lines.reduce((s,x)=>s+x.credit,0);
  if(Math.abs(debit-credit)>0.005){
    lines.push({account_id:contraAcc.id,debit:Math.max(0,credit-debit),credit:Math.max(0,debit-credit),description:'Settlement balancing / FX result'});
  }
  appendObject_('81_journals',{id:journalId,tenant_id:APP_CONFIG.DEFAULT_TENANT_ID,branch_id:trx.branch_id||APP_CONFIG.DEFAULT_BRANCH_ID,journal_no:journalNo,date:String(trx.created_at||iso_()).slice(0,10),reference_type:'TRANSACTION',reference_id:trx.id,memo:'Settlement '+settlementId,status:'POSTED'});
  lines.forEach(line=>appendObject_('82_journal_items',{id:uuid_(),journal_id:journalId,account_id:line.account_id,debit:line.debit,credit:line.credit,description:line.description}));
  return {id:journalId,journal_no:journalNo,total_debit:lines.reduce((s,x)=>s+x.debit,0),total_credit:lines.reduce((s,x)=>s+x.credit,0)};
}

function getOrCreateCoa_(code,name){
  const sh=getSS_().getSheetByName('80_chart_of_accounts');
  const rows=rowsAsObjects_(sh);
  let row=rows.find(x=>String(x.tenant_id)===String(APP_CONFIG.DEFAULT_TENANT_ID)&&String(x.code)===String(code));
  if(!row){
    const id=uuid_();
    appendObject_('80_chart_of_accounts',{id,tenant_id:APP_CONFIG.DEFAULT_TENANT_ID,code,name,type:'BALANCE',status:'ACTIVE'});
    row={id,code,name};
  }
  return row;
}
