import React, { useState, useEffect } from 'react';
import ExcelJS from 'exceljs';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

interface LineItem {
  date: string;
  bfQty: number;
  bfPrice: number;
  bfTotal: number;
  lunchQty: number;
  lunchPrice: number;
  lunchTotal: number;
  dinnerQty: number;
  dinnerPrice: number;
  dinnerTotal: number;
  dayTotal: number;
}

interface Bill {
  _id: string;
  memberId: string;
  memberName: string;
  isLead: boolean;
  paymentStatus: string;
  grandTotal: number;
  paidAmount: number;
  lines: LineItem[];
  batchId?: string;
  startDate?: string;
  endDate?: string;
}

interface Complaint {
  _id: string;
  message: string;
  status: string;
  adminNote?: string;
  createdAt: string;
}

export default function BillsScreen() {
  const user = useAuthStore((state) => state.user);

  const [bills, setBills] = useState<Bill[]>([]);
  const [menusList, setMenusList] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [submittingComplaint, setSubmittingComplaint] = useState(false);
  const [complaintMsg, setComplaintMsg] = useState('');

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  const months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
    { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
    { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' },
  ];
  const years = [2024, 2025, 2026, 2027];

  const loadBills = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bills/my', { params: { month: selectedMonth, year: selectedYear } });
      const billsData = res.data || [];
      setBills(billsData);

      // Fetch menus for the range
      const y = selectedYear;
      const m = selectedMonth;
      const startMonthStr = m < 10 ? `0${m}` : `${m}`;
      const startDate = `${y}-${startMonthStr}-01`;
      const lastDay = new Date(y, m, 0).getDate();
      const lastDayStr = lastDay < 10 ? `0${lastDay}` : `${lastDay}`;
      const endDate = `${y}-${startMonthStr}-${lastDayStr}`;

      const menuRes = await api.get('/menu/range', { params: { startDate, endDate } });
      setMenusList(menuRes.data || []);
    } catch {
      window.alert('Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  const loadComplaints = async () => {
    try {
      const res = await api.get('/complaints');
      setComplaints(res.data || []);
    } catch { /* silent — complaints are non-critical */ }
  };

  useEffect(() => {
    loadBills();
    loadComplaints();
  }, [selectedMonth, selectedYear]);

  const handleComplaintSubmit = async () => {
    if (!complaintMsg.trim()) return;
    setSubmittingComplaint(true);
    try {
      const res = await api.post('/complaints', { message: complaintMsg.trim() });
      setComplaints([res.data, ...complaints]);
      setComplaintMsg('');
      window.alert('Complaint submitted successfully.');
    } catch (e: any) {
      window.alert(e.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setSubmittingComplaint(false);
    }
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  const formatComplaintDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  const selectedMonthLabel = months.find((m) => m.value === selectedMonth)?.label;

  const getComplaintBadgeClasses = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'resolved') return 'bg-green-100 text-green-700';
    if (s === 'in progress' || s === 'pending') return 'bg-amber-100 text-amber-700';
    return 'bg-slate-100 text-slate-600';
  };

  // ── Excel Export Logic matching Vue template ──
  const borderStyle = () => {
    const thin = { style: 'thin' as const, color: { argb: 'FF000000' } };
    return { top: thin, left: thin, bottom: thin, right: thin };
  };

  const formatDateLabel = (d: string) => {
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  const getDishInfoForExcel = (date: string, mealType: 'breakfast' | 'lunch' | 'dinner', linesForDate: any[]) => {
    let qtyKey = '';
    let priceKey = '';
    let addonsKey = '';
    let typeKey = '';
    if (mealType === 'breakfast') {
      qtyKey = 'bfQty';
      priceKey = 'bfPrice';
      addonsKey = 'bfAddons';
      typeKey = 'bfType';
    } else if (mealType === 'lunch') {
      qtyKey = 'lunchQty';
      priceKey = 'lunchPrice';
      addonsKey = 'lunchAddons';
      typeKey = 'lunchType';
    } else if (mealType === 'dinner') {
      qtyKey = 'dinnerQty';
      priceKey = 'dinnerPrice';
      addonsKey = 'dinnerAddons';
      typeKey = 'dinnerType';
    }

    const lineWithOrder = linesForDate.find(l => (l[qtyKey] || 0) > 0);
    const line = lineWithOrder || linesForDate[0];

    let baseName = '';
    const menu = menusList.find(m => m.date === date);
    if (menu) {
      const meal = menu[mealType];
      if (meal && typeof meal === 'object') {
        const isNonVeg = line && line[typeKey] === 'nonveg';
        if (isNonVeg && meal.nonVegEnabled && meal.nonVegName) {
          baseName = meal.nonVegName;
        } else {
          baseName = meal.name || '';
        }
      } else {
        baseName = meal || '';
      }
    }

    if (!line) {
      return { name: baseName, price: 0 };
    }

    const basePrice = line[priceKey] || 0;
    const addons = line[addonsKey] || [];

    if (addons.length > 0) {
      const addonNames = addons.map((a: any) => a.name).join('&');
      const addonPrices = addons.map((a: any) => a.price).join('&');
      const finalName = baseName ? `${baseName}&${addonNames}` : addonNames;
      const finalPrice = `${basePrice}&${addonPrices}`;
      return { name: finalName, price: finalPrice };
    }

    return { name: baseName, price: basePrice };
  };

  const buildMemberBillingExcel = (wb: ExcelJS.Workbook, bill: Bill, periodLabel: string) => {
    const ws = wb.addWorksheet(bill.memberName);

    // Collect unique dates
    const allDates = [...new Set(bill.lines.map(l => l.date))].sort();

    const DELIVERY_RATE = 0.07;   // 7%
    const FIXED_COLS = 2;         // BatchID and name columns
    const MEAL_COLS  = 3;         // BF, Lunch, Dinner per date
    const NUM_COLS   = FIXED_COLS + allDates.length * MEAL_COLS + 3;

    const totalCol    = FIXED_COLS + allDates.length * MEAL_COLS + 1;  // sub-total col
    const deliveryCol = totalCol + 1;                                   // delivery col
    const grandCol    = totalCol + 2;                                   // grand total col

    // Build meal info map (names and prices with addons formatted)
    const mealInfoMap: Record<string, any> = {};
    allDates.forEach(d => {
      const linesForDate = bill.lines.filter(l => l.date === d);
      mealInfoMap[d] = {
        breakfast: getDishInfoForExcel(d, 'breakfast', linesForDate),
        lunch:     getDishInfoForExcel(d, 'lunch',     linesForDate),
        dinner:    getDishInfoForExcel(d, 'dinner',    linesForDate)
      };
    });

    // Column widths
    const colWidths = [{ width: 14 }, { width: 22 }];
    allDates.forEach(d => {
      const info = mealInfoMap[d];
      const bfWidth = Math.max(11, (info.breakfast.name || '').length + 3);
      const lnWidth = Math.max(9,  (info.lunch.name     || '').length + 3);
      const dnWidth = Math.max(9,  (info.dinner.name    || '').length + 3);
      colWidths.push({ width: bfWidth }, { width: lnWidth }, { width: dnWidth });
    });
    colWidths.push({ width: 12 });  // Sub-total
    colWidths.push({ width: 14 });  // Delivery charge
    colWidths.push({ width: 14 });  // Grand total
    ws.columns = colWidths;

    const navy   = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FF0F172A' } };
    const slate  = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFF1F5F9' } };
    const yellow = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFFEF9C3' } };
    const green  = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFD1FAE5' } };

    // ── Row 1: Title ────────────────────────────────────────────────────────
    const r1 = ws.addRow(['VJ Home Foods – Statement of Account']);
    ws.mergeCells(r1.number, 1, r1.number, NUM_COLS);
    r1.getCell(1).font = { name: 'Calibri', size: 18, bold: true, color: { argb: 'FFFFFFFF' } };
    r1.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    r1.getCell(1).fill = navy;
    r1.height = 36;

    // ── Row 2: Member + period ──────────────────────────────────────────────
    const r2 = ws.addRow([`Member Name: ${bill.memberName}   |   Member ID: ${bill.memberId}   |   Batch: ${bill.batchId || user?.batchId || ''}   |   ${periodLabel}`]);
    ws.mergeCells(r2.number, 1, r2.number, NUM_COLS);
    r2.getCell(1).font = { name: 'Calibri', size: 11, bold: true };
    r2.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    r2.getCell(1).fill = slate;
    r2.height = 20;

    // ── Row 3: blank ──────────────────────────────────────────────────────
    ws.addRow([]);

    // ── Row 4: DATE headers (merged per date, 3 cols each) ─────────────────
    const dateRow = ws.addRow(['Date & month', '']);
    ws.mergeCells(dateRow.number, 1, dateRow.number, 2);
    let col = 3;
    allDates.forEach(d => {
      dateRow.getCell(col).value = formatDateLabel(d);
      ws.mergeCells(dateRow.number, col, dateRow.number, col + MEAL_COLS - 1);
      col += MEAL_COLS;
    });
    dateRow.getCell(col).value = 'SUB-TOTAL'; col++;
    dateRow.getCell(col).value = 'DELIVERY (7%)'; col++;
    dateRow.getCell(col).value = 'GRAND TOTAL';

    // Style Date Row
    for (let c = 1; c <= NUM_COLS; c++) {
      dateRow.getCell(c).border = borderStyle();
      dateRow.getCell(c).fill = navy;
      dateRow.getCell(c).font = { bold: true, name: 'Calibri', size: 10, color: { argb: 'FFFFFFFF' } };
      dateRow.getCell(c).alignment = { horizontal: 'center', vertical: 'middle' };
    }
    dateRow.height = 22;

    // ── Row 5: Dishes row ──────────────────────────────────────────────────
    const dishesRow = ws.addRow(['Dishes', '']);
    ws.mergeCells(dishesRow.number, 1, dishesRow.number, 2);

    // ── Row 6: PRICE row (labeled `& price`) ──────────────────────────────
    const priceRow = ws.addRow(['& price', '']);
    ws.mergeCells(priceRow.number, 1, priceRow.number, 2);

    col = 3;
    allDates.forEach(d => {
      dishesRow.getCell(col).value = mealInfoMap[d].breakfast.name; col++;
      dishesRow.getCell(col).value = mealInfoMap[d].lunch.name;     col++;
      dishesRow.getCell(col).value = mealInfoMap[d].dinner.name;    col++;
    });
    dishesRow.getCell(col).value = ''; col++;
    dishesRow.getCell(col).value = ''; col++;
    dishesRow.getCell(col).value = '';

    // Style Dishes Row
    for (let c = 1; c <= NUM_COLS; c++) {
      dishesRow.getCell(c).border = borderStyle();
      dishesRow.getCell(c).fill = slate;
      dishesRow.getCell(c).font = { name: 'Calibri', size: 9, color: { argb: 'FF334155' } };
      dishesRow.getCell(c).alignment = { horizontal: 'center', vertical: 'middle' };
    }
    dishesRow.height = 18;

    col = 3;
    allDates.forEach(d => {
      priceRow.getCell(col).value = mealInfoMap[d].breakfast.price; col++;
      priceRow.getCell(col).value = mealInfoMap[d].lunch.price;     col++;
      priceRow.getCell(col).value = mealInfoMap[d].dinner.price;    col++;
    });
    priceRow.getCell(col).value = ''; col++;
    priceRow.getCell(col).value = '7%'; col++;
    priceRow.getCell(col).value = '';

    // Style Price Row
    for (let c = 1; c <= NUM_COLS; c++) {
      priceRow.getCell(c).border = borderStyle();
      priceRow.getCell(c).fill = yellow;
      priceRow.getCell(c).font = { bold: true, name: 'Calibri', size: 9, italic: true };
      priceRow.getCell(c).alignment = { horizontal: 'center', vertical: 'middle' };
    }
    priceRow.height = 18;

    // ── Row 7: Column sub-headers row ────────────────────────────────────
    const subHeaderRow = ws.addRow(['BatchID', 'name']);
    col = 3;
    allDates.forEach(() => {
      subHeaderRow.getCell(col).value = 'Breakfast'; col++;
      subHeaderRow.getCell(col).value = 'Lunch'; col++;
      subHeaderRow.getCell(col).value = 'Dinner'; col++;
    });
    subHeaderRow.getCell(col).value = 'Sub-Total'; col++;
    subHeaderRow.getCell(col).value = 'Delivery (7%)'; col++;
    subHeaderRow.getCell(col).value = 'Grand Total';

    // Style Sub-header Row
    for (let c = 1; c <= NUM_COLS; c++) {
      subHeaderRow.getCell(c).border = borderStyle();
      subHeaderRow.getCell(c).fill = slate;
      subHeaderRow.getCell(c).font = { bold: true, name: 'Calibri', size: 9, color: { argb: 'FF334155' } };
      subHeaderRow.getCell(c).alignment = { horizontal: 'center', vertical: 'middle' };
    }
    subHeaderRow.height = 18;

    // ── Row 8: Data row ────────────────────────────────────────────────────
    const lineMap: Record<string, any> = {};
    bill.lines.forEach(l => { lineMap[l.date] = l; });

    const rowValues: any[] = [bill.memberId, bill.memberName];
    allDates.forEach(d => {
      const l = lineMap[d];
      rowValues.push(l ? l.bfTotal : 0);
      rowValues.push(l ? l.lunchTotal : 0);
      rowValues.push(l ? l.dinnerTotal : 0);
    });
    const subTotal      = bill.grandTotal;
    const deliveryCharge = Math.round(subTotal * DELIVERY_RATE * 100) / 100;
    const grandTotal     = Math.round((subTotal + deliveryCharge) * 100) / 100;
    rowValues.push(subTotal);
    rowValues.push(deliveryCharge);
    rowValues.push(grandTotal);

    const dataRow = ws.addRow(rowValues);
    for (let c = 1; c <= NUM_COLS; c++) {
      dataRow.getCell(c).font = { name: 'Calibri', size: 10 };
      dataRow.getCell(c).border = borderStyle();
      if (c > 2) dataRow.getCell(c).alignment = { horizontal: 'center' };
    }
    dataRow.getCell(1).alignment = { horizontal: 'center' };

    // Style delivery and grand total columns
    dataRow.getCell(deliveryCol).fill = yellow;
    dataRow.getCell(grandCol).fill   = green;
    dataRow.getCell(grandCol).font   = { name: 'Calibri', size: 10, bold: true };

    if (bill.isLead) {
      for (let c = 1; c <= NUM_COLS; c++) {
        dataRow.getCell(c).font = { name: 'Calibri', size: 10, bold: true };
      }
      dataRow.getCell(grandCol).fill = green;
    }
    dataRow.height = 18;
  };

  const triggerDownload = async (wb: ExcelJS.Workbook, filename: string) => {
    const buf = await wb.xlsx.writeBuffer();
    const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `${filename}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadMemberBill = async (bill: Bill) => {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'VJ Home Foods OMS';
    const periodLabel = `${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}`;
    buildMemberBillingExcel(wb, bill, periodLabel);
    await triggerDownload(wb, `Bill_${bill.memberId}_${bill.memberName.replace(/ /g,'_')}_${periodLabel.replace(/ /g,'_')}`);
  };

  return (
    <div className="p-4 pb-14 space-y-5 overflow-y-auto h-full flex flex-col bg-[#f8fafc]">
      {/* Header Title */}
      <div className="shrink-0">
        <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">My Order History</h1>
        <p className="text-[11px] text-slate-400 font-bold mt-0.5 uppercase tracking-wider">
          View your past meal quantities and download statements
        </p>
      </div>

      {/* Period Selector Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-xs shrink-0 relative z-50">
        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Select Period</div>
        <div className="flex gap-3">
          {/* Month selector */}
          <div className="flex-1 relative">
            <button
              onClick={() => { setShowMonthDropdown(!showMonthDropdown); setShowYearDropdown(false); }}
              className="w-full h-10 border border-slate-200 rounded-xl px-3.5 flex items-center justify-between bg-white cursor-pointer hover:border-slate-300 transition-colors"
            >
              <span className="text-xs font-black text-slate-800">{selectedMonthLabel}</span>
              <span className="text-[9px] text-slate-400">▼</span>
            </button>
            {showMonthDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto z-[200] p-1">
                {months.map(m => (
                  <button
                    key={m.value}
                    onClick={() => { setSelectedMonth(m.value); setShowMonthDropdown(false); }}
                    className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors cursor-pointer ${
                      selectedMonth === m.value ? 'bg-brand/10 text-brand' : 'text-slate-700'
                    }`}
                  >{m.label}</button>
                ))}
              </div>
            )}
          </div>

          {/* Year selector */}
          <div className="flex-1 relative">
            <button
              onClick={() => { setShowYearDropdown(!showYearDropdown); setShowMonthDropdown(false); }}
              className="w-full h-10 border border-slate-200 rounded-xl px-3.5 flex items-center justify-between bg-white cursor-pointer hover:border-slate-300 transition-colors"
            >
              <span className="text-xs font-black text-slate-800">{selectedYear}</span>
              <span className="text-[9px] text-slate-400">▼</span>
            </button>
            {showYearDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-[200] p-1">
                {years.map(y => (
                  <button
                    key={y}
                    onClick={() => { setSelectedYear(y); setShowYearDropdown(false); }}
                    className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors cursor-pointer ${
                      selectedYear === y ? 'bg-brand/10 text-brand' : 'text-slate-700'
                    }`}
                  >{y}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-[3px] border-slate-200 border-t-brand rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Loading history…</span>
        </div>
      ) : (
        <div className="flex-1 space-y-5">
          {bills.length > 0 ? (
            <div className="space-y-4">
              {bills.map(bill => (
                <div key={bill._id} className="bg-white rounded-2xl border border-slate-200/60 shadow-xs overflow-hidden">
                  {/* Bill Card Header */}
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-100 text-slate-500 font-mono text-[9px] font-black px-2 py-0.5 rounded-md">
                        {bill.memberId}
                      </span>
                      <span className="text-xs font-black text-slate-900">{bill.memberName}</span>
                      {bill.isLead && (
                        <span className="bg-brand text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                          LEAD
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => downloadMemberBill(bill)}
                      className="bg-[#0f172a] hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      <span>DOWNLOAD EXCEL</span>
                    </button>
                  </div>

                  {/* Day Breakdowns Responsive Grid Tiles matching screenshots */}
                  <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-[480px] overflow-y-auto">
                    {bill.lines.map(line => (
                      <div
                        key={line.date}
                        className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 flex flex-col justify-between hover:bg-slate-50 transition"
                      >
                        <div className="text-[11px] font-black text-slate-800 text-center pb-1 border-b border-slate-200/50">
                          {formatDate(line.date)}
                        </div>
                        <div className="text-[10px] text-slate-500 font-bold mt-2 space-y-1">
                          <div className="flex justify-between">
                            <span>B:</span>
                            <span className={line.bfQty > 0 ? "text-slate-900 font-black" : "text-slate-300"}>
                              {line.bfQty}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>L:</span>
                            <span className={line.lunchQty > 0 ? "text-slate-900 font-black" : "text-slate-300"}>
                              {line.lunchQty}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>D:</span>
                            <span className={line.dinnerQty > 0 ? "text-slate-900 font-black" : "text-slate-300"}>
                              {line.dinnerQty}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-slate-200/60 shadow-xs text-center">
              <div className="text-4xl mb-3">📭</div>
              <div className="text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                No order history found
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                Records are compiled automatically from daily batch orders for {selectedMonthLabel} {selectedYear}.
              </div>
            </div>
          )}

          {/* Submit Complaint Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-xs space-y-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Submit a Complaint
            </h3>
            <textarea
              placeholder="Describe your issue with meal delivery or quality..."
              value={complaintMsg}
              onChange={(e) => setComplaintMsg(e.target.value)}
              rows={3}
              className="w-full border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 resize-none focus:outline-none focus:border-brand/50 transition-colors bg-slate-50/30"
            />
            <button
              onClick={handleComplaintSubmit}
              disabled={!complaintMsg.trim() || submittingComplaint}
              className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
            >
              {submittingComplaint ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
              ) : 'Submit Complaint'}
            </button>

            {/* Past Complaints */}
            {complaints.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-wider">My Complaints</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {complaints.map(c => (
                    <div key={c._id} className="border border-slate-100 rounded-xl p-3 space-y-1.5 bg-slate-50/30">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-bold">{formatComplaintDate(c.createdAt)}</span>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${getComplaintBadgeClasses(c.status)}`}>{c.status}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-700">{c.message}</p>
                      {c.adminNote && (
                        <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-2.5 mt-1">
                          <span className="text-[9px] font-black text-blue-600 uppercase tracking-wider">Admin Reply:</span>
                          <p className="text-[11px] text-blue-800 mt-0.5 font-semibold">{c.adminNote}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
