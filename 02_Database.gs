const SHEETS = [
  ['00_settings',['key','value']],
  ['01_tenants',['id','code','name','status','created_at']],
  ['02_branches',['id','tenant_id','code','name','status','created_at']],
  ['03_users',['id','tenant_id','branch_id','name','email','role_id','status','created_at']],
  ['04_roles',['id','tenant_id','code','name','status']],
  ['05_permissions',['id','role_id','permission','status']],
  ['10_customers',['id','tenant_id','branch_id','customer_code','id_pjk','name','birth_place','birth_date','address','nationality','gender','occupation','phone','account_no','id_type','ktp_no','other_id','cif','npwp','local_id','registered_at','id_image_url','created_at','updated_at']],
  ['11_customer_documents',['id','tenant_id','customer_id','type','file_id','file_url','status','created_at']],
  ['12_customer_kyc',['id','tenant_id','customer_id','status','risk_level','verified_at','verified_by','notes']],
  ['20_currencies',['id','code','name','country','status']],
  ['21_denominations',['id','currency_id','value','type','status']],
  ['30_rate_sources',['id','name','type','endpoint','status']],
  ['31_rates',['id','currency_id','buy','sell','source_id','effective_at']],
  ['32_rate_snapshots',['id','transaction_id','currency_id','buy','sell','locked_at']],
  ['40_transaction_carts',['id','tenant_id','branch_id','cart_no','customer_id','status','grand_total','created_at','updated_at']],
  ['41_transactions',['id','tenant_id','branch_id','trx_no','cart_id','customer_id','status','grand_total','currency_total','created_at','updated_at']],
  ['42_transaction_items',['id','transaction_id','side','currency_id','denomination','qty','rate','amount','rate_snapshot_id']],
  ['43_transaction_item_rates',['id','transaction_item_id','buy','sell','locked_at']],
  ['44_transaction_payments',['id','transaction_id','method','amount','status','reference','proof_url']],
  ['45_payment_allocations',['id','payment_id','account_type','account_id','amount']],
  ['46_settlements',['id','transaction_id','total','status','settled_at']],
  ['50_stock',['id','tenant_id','branch_id','currency_id','denomination','available_qty','reserved_qty','status']],
  ['51_stock_movements',['id','tenant_id','branch_id','currency_id','denomination','movement_type','qty','reference_type','reference_id','created_at']],
  ['52_stock_reservations',['id','transaction_id','currency_id','denomination','qty','status','created_at']],
  ['60_cash_accounts',['id','tenant_id','branch_id','currency','account_name','balance','status']],
  ['61_cash_movements',['id','cash_account_id','movement_type','amount','reference_type','reference_id','created_at']],
  ['62_bank_accounts',['id','tenant_id','branch_id','bank_name','account_no','account_name','balance','status']],
  ['63_bank_movements',['id','bank_account_id','movement_type','amount','reference_type','reference_id','created_at']],
  ['64_vault',['id','tenant_id','branch_id','currency','balance','status']],
  ['70_closings',['id','tenant_id','branch_id','date','status','expected_cash','physical_cash','difference','approved_by','created_at']],
  ['71_reconciliations',['id','closing_id','type','expected','actual','difference','status','notes']],
  ['72_gantungan',['id','tenant_id','branch_id','date','description','amount','status','returned_at','created_by']],
  ['80_chart_of_accounts',['id','tenant_id','code','name','type','status']],
  ['81_journals',['id','tenant_id','branch_id','journal_no','date','reference_type','reference_id','memo','status']],
  ['82_journal_items',['id','journal_id','account_id','debit','credit','description']],
  ['83_ledger',['id','journal_item_id','account_id','date','debit','credit','balance']],
  ['90_compliance_rules',['id','code','name','value','unit','effective_from','effective_to','status']],
  ['91_threshold_usage',['id','tenant_id','customer_id','period','usd_equivalent','limit_value','remaining','status','updated_at']],
  ['92_compliance_cases',['id','tenant_id','customer_id','transaction_id','case_type','risk','status','created_at']],
  ['93_aml_alerts',['id','tenant_id','customer_id','transaction_id','rule_code','severity','status','created_at']],
  ['94_regulatory_reports',['id','tenant_id','report_type','period','status','file_url','submitted_at']],
  ['100_bookings',['id','tenant_id','branch_id','booking_no','customer_id','scheduled_at','dp_amount','status','transaction_id']],
  ['101_waiting_list',['id','tenant_id','branch_id','customer_id','ticket_no','status','joined_at']],
  ['102_pickups',['id','tenant_id','branch_id','customer_id','reference_no','status','scheduled_at','completed_at']],
  ['110_employees',['id','tenant_id','employee_code','name','status']],
  ['111_shifts',['id','tenant_id','branch_id','date','employee_id','shift','start_time','end_time','status']],
  ['112_attendance',['id','tenant_id','employee_id','date','check_in','check_out','lat','lng','photo_url','status']],
  ['120_documents',['id','tenant_id','branch_id','entity_type','entity_id','name','mime_type','file_id','file_url','status','created_at']],
  ['121_document_versions',['id','document_id','version','file_id','created_at']],
  ['130_notifications',['id','tenant_id','user_id','type','title','message','read_at','created_at']],
  ['131_chat_rooms',['id','tenant_id','name','type','status']],
  ['132_chat_messages',['id','room_id','user_id','message','created_at']],
  ['133_whatsapp_queue',['id','tenant_id','phone','message','status','attempts','scheduled_at','sent_at']],
  ['140_audit_logs',['id','tenant_id','branch_id','actor_id','action','entity_type','entity_id','before_json','after_json','created_at']],
  ['141_sequences',['key','prefix','date_key','last_number']],
  ['142_system_logs',['id','level','message','context_json','created_at']]
];

function getSS_() {
  const id = APP_CONFIG.SPREADSHEET_ID || PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  return id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
}
function ensureSheet_(name, headers) {
  const ss=getSS_();
  let sh=ss.getSheetByName(name);
  if (!sh) sh=ss.insertSheet(name);
  if (sh.getLastRow()===0) sh.getRange(1,1,1,headers.length).setValues([headers]);
  return sh;
}
function installDatabase() {
  SHEETS.forEach(s=>ensureSheet_(s[0],s[1]));
  PropertiesService.getScriptProperties().setProperty('DB_VERSION','1.0.0');
  return {ok:true, sheets:SHEETS.length, version:'1.0.0'};
}
