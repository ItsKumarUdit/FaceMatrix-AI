import React, { useState } from "react";

const FeeStructure = () => {
  const [selectedCourse, setSelectedCourse] = useState("B.Tech CSE");

  const feeData = {
    "B.Tech CSE": {
      tuition: 95000,
      exam: 5000,
      library: 3000,
      lab: 8000,
      development: 5000,
      registration: 2000,
      total: 118000,
    },
    "B.Tech ECE": {
      tuition: 90000,
      exam: 5000,
      library: 3000,
      lab: 7500,
      development: 5000,
      registration: 2000,
      total: 112500,
    },
    "B.Tech CSE (AI)": {
      tuition: 98000,
      exam: 5000,
      library: 3000,
      lab: 8500,
      development: 5000,
      registration: 2000,
      total: 121500,
    },
  };

  const fees = feeData[selectedCourse];

  const formatCurrency = (amount) =>
    `₹${amount.toLocaleString("en-IN")}`;

  return (
    <div className="fee-page">
      {/* Header */}
      <div className="fee-header">
        <div>
          <h1>Student Fee Structure</h1>
          <p>Academic Session 2026–27</p>
        </div>

        <div className="fee-session">
          <span>Academic Year</span>
          <strong>2026–27</strong>
        </div>
      </div>

      {/* Course Selection */}
      <div className="fee-card">
        <div className="fee-card-header">
          <div>
            <h2>Course Fee Details</h2>
            <p>Select a course to view its fee structure</p>
          </div>

          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            {Object.keys(feeData).map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
        </div>

        {/* Fee Table */}
        <div className="fee-table-wrapper">
          <table className="fee-table">
            <thead>
              <tr>
                <th>Fee Component</th>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Tuition Fee</td>
                <td>Annual academic tuition fee</td>
                <td>{formatCurrency(fees.tuition)}</td>
              </tr>

              <tr>
                <td>Examination Fee</td>
                <td>Semester examination and evaluation</td>
                <td>{formatCurrency(fees.exam)}</td>
              </tr>

              <tr>
                <td>Library Fee</td>
                <td>Library and digital resources</td>
                <td>{formatCurrency(fees.library)}</td>
              </tr>

              <tr>
                <td>Laboratory Fee</td>
                <td>Laboratory and practical facilities</td>
                <td>{formatCurrency(fees.lab)}</td>
              </tr>

              <tr>
                <td>Development Fee</td>
                <td>Infrastructure and campus development</td>
                <td>{formatCurrency(fees.development)}</td>
              </tr>

              <tr>
                <td>Registration Fee</td>
                <td>Annual student registration</td>
                <td>{formatCurrency(fees.registration)}</td>
              </tr>
            </tbody>

            <tfoot>
              <tr>
                <td colSpan="2">Total Annual Fee</td>
                <td>{formatCurrency(fees.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="fee-summary">
        <div className="fee-summary-card">
          <span>Selected Course</span>
          <strong>{selectedCourse}</strong>
        </div>

        <div className="fee-summary-card">
          <span>Annual Fee</span>
          <strong>{formatCurrency(fees.total)}</strong>
        </div>

        <div className="fee-summary-card">
          <span>Payment Status</span>
          <strong className="status-demo">Demo Structure</strong>
        </div>
      </div>

      {/* Note */}
      <div className="fee-note">
        <strong>Note:</strong> This is a demo fee structure for presentation
        purposes. Actual fees may vary depending on the academic program and
        university regulations.
      </div>
    </div>
  );
};

export default FeeStructure;