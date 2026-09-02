import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

const FeesModule = () => {
  const [fees, setFees] = useState([]);
  const [metrics, setMetrics] = useState({ totalBilled: 0, totalCollected: 0, totalOutstanding: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedFeeForReceipt, setSelectedFeeForReceipt] = useState(null);
  const [selectedFeeForPayment, setSelectedFeeForPayment] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // Payment Collection Form
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'UPI',
    transactionRef: '',
  });

  // Invoice Generation Form
  const [invoiceForm, setInvoiceForm] = useState({
    studentName: 'Aarav Sharma',
    admissionNumber: 'ADM/2026/0101',
    rollNumber: '101',
    className: 'Class 10 - Section A',
    title: 'Composite Term Fee (Academic Session 2026-27)',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString().split('T')[0],
    tuitionFee: 25000,
    admissionFee: 5000,
    examFee: 3000,
    transportFee: 0,
    computerFee: 4000,
    annualFee: 8000,
    otherFee: 0,
  });

  const fetchFees = async () => {
    try {
      setLoading(true);
      const res = await api.get('/finance/fees');
      if (res.data.success) {
        setFees(res.data.fees);
        setMetrics(res.data.metrics);
      }
    } catch (err) {
      console.error('Failed to fetch fees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedFeeForPayment) return;
    try {
      const res = await api.patch(`/finance/fees/${selectedFeeForPayment._id}/pay`, paymentForm);
      if (res.data.success) {
        setSelectedFeeForPayment(null);
        setPaymentForm({ amount: '', paymentMethod: 'UPI', transactionRef: '' });
        fetchFees();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Payment collection failed');
    }
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      const feeBreakdown = [
        { head: 'Tuition Fee', amount: Number(invoiceForm.tuitionFee) },
        { head: 'Admission Fee', amount: Number(invoiceForm.admissionFee) },
        { head: 'Examination Fee', amount: Number(invoiceForm.examFee) },
        { head: 'Transport Fee', amount: Number(invoiceForm.transportFee) },
        { head: 'Computer Fee', amount: Number(invoiceForm.computerFee) },
        { head: 'Annual Fee', amount: Number(invoiceForm.annualFee) },
        { head: 'Other Fee', amount: Number(invoiceForm.otherFee) },
      ].filter((item) => item.amount > 0);

      const payload = {
        studentName: invoiceForm.studentName,
        admissionNumber: invoiceForm.admissionNumber,
        rollNumber: invoiceForm.rollNumber,
        className: invoiceForm.className,
        title: invoiceForm.title,
        dueDate: invoiceForm.dueDate,
        feeBreakdown,
      };

      const res = await api.post('/finance/fees', payload);
      if (res.data.success) {
        setShowGenerateModal(false);
        fetchFees();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create fee invoice');
    }
  };

  const filtered = fees.filter((f) => statusFilter === 'All' || f.status === statusFilter);

  return (
    <div className="module-view-container">
      {/* Financial Overview Metrics */}
      <div className="stats-cards-grid">
        <div className="admin-stat-card card-fees">
          <div className="stat-card-value">₹{metrics.totalBilled?.toLocaleString('en-IN')}</div>
          <div className="stat-card-label">Total Fee Invoiced</div>
          <div className="stat-card-sub">Session 2026-27 Composite Assessment</div>
        </div>
        <div className="admin-stat-card card-students">
          <div className="stat-card-value" style={{ color: '#10b981' }}>
            ₹{metrics.totalCollected?.toLocaleString('en-IN')}
          </div>
          <div className="stat-card-label">Total Revenue Realized</div>
          <div className="stat-card-sub">Collected via UPI, Net Banking, Cheque</div>
        </div>
        <div className="admin-stat-card card-leaves">
          <div className="stat-card-value" style={{ color: '#f59e0b' }}>
            ₹{metrics.totalOutstanding?.toLocaleString('en-IN')}
          </div>
          <div className="stat-card-label">Outstanding Dues</div>
          <div className="stat-card-sub">Pending / Partial installments</div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="module-controls-bar">
        <div>
          <h3>🇮🇳 Institutional Fee Collection Ledger</h3>
          <p className="subtitle">Tuition, admission, exam, transport, and annual composite fee registers</p>
        </div>

        <div className="search-filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-control module-select"
          >
            <option value="All">All Invoices ({fees.length})</option>
            <option value="Paid">🟢 Settled / Paid</option>
            <option value="Partial">🟡 Partial Payments</option>
            <option value="Pending">🔴 Pending Dues</option>
          </select>

          <button onClick={() => setShowGenerateModal(true)} className="btn btn-primary">
            + Generate Fee Invoice
          </button>
        </div>
      </div>

      {/* Fees Ledger Table */}
      <div className="table-responsive card">
        {loading ? (
          <div className="module-loading">Loading institutional fee records...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Student & Class</th>
                <th>Total Fee</th>
                <th>Paid Amount</th>
                <th>Remaining Due</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f._id}>
                  <td>
                    <span className="code-pill">{f.invoiceNumber}</span>
                  </td>
                  <td>
                    <strong>{f.studentName}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {f.className} • #{f.rollNumber}
                    </div>
                  </td>
                  <td><strong>₹{f.totalAmount?.toLocaleString('en-IN')}</strong></td>
                  <td><strong style={{ color: '#10b981' }}>₹{f.paidAmount?.toLocaleString('en-IN')}</strong></td>
                  <td>
                    <strong style={{ color: f.remainingAmount > 0 ? '#ef4444' : '#10b981' }}>
                      ₹{f.remainingAmount?.toLocaleString('en-IN')}
                    </strong>
                  </td>
                  <td>{new Date(f.dueDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-pill status-${f.status === 'Paid' ? 'approved' : f.status === 'Partial' ? 'in-progress' : 'danger'}`}>
                      {f.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {f.remainingAmount > 0 && (
                        <button
                          onClick={() => {
                            setSelectedFeeForPayment(f);
                            setPaymentForm({
                              amount: f.remainingAmount,
                              paymentMethod: 'UPI',
                              transactionRef: `UPI-${Math.floor(100000 + Math.random() * 900000)}`,
                            });
                          }}
                          className="btn btn-primary btn-sm"
                        >
                          💳 Collect Fee
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedFeeForReceipt(f)}
                        className="btn btn-outline-primary btn-sm"
                      >
                        📄 Receipt
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 1. Collect Payment Modal */}
      {selectedFeeForPayment && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <div>
                <h3>💳 Record Fee Payment</h3>
                <p className="subtitle">
                  Student: <strong>{selectedFeeForPayment.studentName}</strong> • Due: <strong>₹{selectedFeeForPayment.remainingAmount?.toLocaleString('en-IN')}</strong>
                </p>
              </div>
              <button onClick={() => setSelectedFeeForPayment(null)} className="close-btn">&times;</button>
            </div>

            <form onSubmit={handleRecordPayment} className="modal-form">
              <div className="form-group">
                <label>Amount to Collect (₹) *</label>
                <input
                  type="number"
                  required
                  max={selectedFeeForPayment.remainingAmount}
                  min={1}
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Payment Method *</label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                    className="form-control"
                  >
                    <option value="UPI">UPI / QR (BHIM, PhonePe, GPay)</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Cheque">Cheque / Demand Draft</option>
                    <option value="Cash">Cash Receipt</option>
                    <option value="Debit Card">Debit / Credit Card</option>
                  </select>
                </div>
                <div className="form-group flex-1">
                  <label>Transaction / UTR Reference</label>
                  <input
                    type="text"
                    required
                    value={paymentForm.transactionRef}
                    onChange={(e) => setPaymentForm({ ...paymentForm, transactionRef: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setSelectedFeeForPayment(null)} className="btn btn-outline-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  ✔ Confirm Payment Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Official Fee Receipt Certificate Modal */}
      {selectedFeeForReceipt && (
        <div className="modal-backdrop">
          <div className="modal-box report-card-modal-box" style={{ maxWidth: '800px' }}>
            <div className="report-card-container">
              {/* Receipt Header */}
              <div className="report-card-header">
                <div className="report-school-logo">🏛️</div>
                <div className="report-school-info">
                  <h2>School Management System</h2>
                  <p className="school-aff-text">CBSE Affiliation No: 2130842 • School Code: CBSE-SCH-84210</p>
                  <p className="school-addr-text">Plot 42, Institutional Area, Knowledge Park III, Greater Noida - 201306</p>
                  <div className="report-term-title">
                    OFFICIAL FEE PAYMENT RECEIPT • SESSION 2026-27
                  </div>
                </div>
              </div>

              {/* Student Details */}
              <div className="report-student-meta-grid">
                <div><span>Receipt No:</span> <strong>{selectedFeeForReceipt.invoiceNumber}</strong></div>
                <div><span>Student Name:</span> <strong>{selectedFeeForReceipt.studentName}</strong></div>
                <div><span>Admission No:</span> <strong>{selectedFeeForReceipt.admissionNumber}</strong></div>
                <div><span>Class & Section:</span> <strong>{selectedFeeForReceipt.className}</strong></div>
                <div><span>Academic Term:</span> <strong>Annual Session 2026-27</strong></div>
                <div><span>Payment Status:</span> <strong style={{ color: selectedFeeForReceipt.status === 'Paid' ? '#10b981' : '#f59e0b' }}>{selectedFeeForReceipt.status}</strong></div>
              </div>

              {/* Fee Heads Breakdown */}
              <table className="report-card-table">
                <thead>
                  <tr>
                    <th>Fee Component</th>
                    <th>Assessment Head</th>
                    <th>Payable Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedFeeForReceipt.feeBreakdown && selectedFeeForReceipt.feeBreakdown.map((item, idx) => (
                    <tr key={idx}>
                      <td><strong>{item.head}</strong></td>
                      <td>Tuition & Curriculum Maintenance</td>
                      <td><strong>₹{item.amount?.toLocaleString('en-IN')}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Financial Summary */}
              <div className="report-grand-summary">
                <div className="summary-item">
                  <span>Total Fee Assessed:</span>
                  <strong>₹{selectedFeeForReceipt.totalAmount?.toLocaleString('en-IN')}</strong>
                </div>
                <div className="summary-item">
                  <span>Amount Realized:</span>
                  <strong style={{ color: '#10b981' }}>₹{selectedFeeForReceipt.paidAmount?.toLocaleString('en-IN')}</strong>
                </div>
                <div className="summary-item">
                  <span>Remaining Due:</span>
                  <strong style={{ color: selectedFeeForReceipt.remainingAmount > 0 ? '#ef4444' : '#10b981' }}>
                    ₹{selectedFeeForReceipt.remainingAmount?.toLocaleString('en-IN')}
                  </strong>
                </div>
                <div className="summary-item">
                  <span>Installment Due Date:</span>
                  <strong>{new Date(selectedFeeForReceipt.dueDate).toLocaleDateString()}</strong>
                </div>
              </div>

              {/* Transaction Log */}
              {selectedFeeForReceipt.transactions && selectedFeeForReceipt.transactions.length > 0 && (
                <div style={{ margin: '1rem 0', fontSize: '0.85rem' }}>
                  <strong>Transaction History:</strong>
                  <ul style={{ paddingLeft: '1.25rem', marginTop: '0.35rem', color: '#475569' }}>
                    {selectedFeeForReceipt.transactions.map((tx, tIdx) => (
                      <li key={tIdx}>
                        Paid <strong>₹{tx.amount?.toLocaleString('en-IN')}</strong> via <strong>{tx.paymentMethod}</strong> (Ref: {tx.transactionRef}) on {new Date(tx.date).toLocaleDateString()}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Signatures */}
              <div className="report-signatures-row">
                <div className="sig-block">
                  <div className="sig-line">Accounts Officer</div>
                  <span>Authorized Cashier</span>
                </div>
                <div className="sig-block">
                  <div className="sig-line">Dr. Rajeshwar Prasad</div>
                  <span>Principal</span>
                </div>
              </div>
            </div>

            <div className="modal-actions" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <button onClick={() => window.print()} className="btn btn-outline-primary">
                🖨️ Print / Download Official Receipt
              </button>
              <button onClick={() => setSelectedFeeForReceipt(null)} className="btn btn-primary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Generate Fee Invoice Modal */}
      {showGenerateModal && (
        <div className="modal-backdrop">
          <div className="modal-box modal-lg">
            <div className="modal-header">
              <h3>+ Generate Institutional Fee Invoice</h3>
              <button onClick={() => setShowGenerateModal(false)} className="close-btn">&times;</button>
            </div>

            <form onSubmit={handleCreateInvoice} className="modal-form">
              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Student Name *</label>
                  <input
                    type="text"
                    required
                    value={invoiceForm.studentName}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, studentName: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Class & Section *</label>
                  <input
                    type="text"
                    required
                    value={invoiceForm.className}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, className: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Tuition Fee (₹)</label>
                  <input
                    type="number"
                    value={invoiceForm.tuitionFee}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, tuitionFee: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Admission Fee (₹)</label>
                  <input
                    type="number"
                    value={invoiceForm.admissionFee}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, admissionFee: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Examination Fee (₹)</label>
                  <input
                    type="number"
                    value={invoiceForm.examFee}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, examFee: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Computer Lab Fee (₹)</label>
                  <input
                    type="number"
                    value={invoiceForm.computerFee}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, computerFee: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Annual Composite Fee (₹)</label>
                  <input
                    type="number"
                    value={invoiceForm.annualFee}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, annualFee: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Due Date *</label>
                  <input
                    type="date"
                    required
                    value={invoiceForm.dueDate}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowGenerateModal(false)} className="btn btn-outline-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeesModule;
