import React, { useMemo, useState } from "react";

const Fee = () => {
  const [selectedSession, setSelectedSession] = useState("2026-27");
  const [selectedGroup, setSelectedGroup] = useState("Nursery - UKG");
  const [showEditModal, setShowEditModal] = useState(false);

  // Demo session-wise fee structure
  const [feeStructures, setFeeStructures] = useState({
    "2026-27": {
      "Nursery - UKG": {
        monthlyTuition: 2500,
        annualCharges: 6000,
        admissionFee: 5000,
        examFee: 1500,
        activityFee: 2000,
        computerFee: 1000,
        libraryFee: 500,
        transportFee: 1800,
      },

      "Class 1 - 5": {
        monthlyTuition: 3200,
        annualCharges: 7500,
        admissionFee: 6000,
        examFee: 2000,
        activityFee: 2500,
        computerFee: 1200,
        libraryFee: 700,
        transportFee: 2000,
      },

      "Class 6 - 8": {
        monthlyTuition: 3800,
        annualCharges: 8500,
        admissionFee: 7000,
        examFee: 2500,
        activityFee: 3000,
        computerFee: 1500,
        libraryFee: 800,
        transportFee: 2200,
      },

      "Class 9 - 10": {
        monthlyTuition: 4500,
        annualCharges: 9500,
        admissionFee: 8000,
        examFee: 3000,
        activityFee: 3500,
        computerFee: 1800,
        libraryFee: 1000,
        transportFee: 2400,
      },

      "Class 11 - 12": {
        monthlyTuition: 5200,
        annualCharges: 11000,
        admissionFee: 9000,
        examFee: 3500,
        activityFee: 4000,
        computerFee: 2000,
        libraryFee: 1200,
        transportFee: 2600,
      },
    },

    "2027-28": {
      "Nursery - UKG": {
        monthlyTuition: 2700,
        annualCharges: 6500,
        admissionFee: 5500,
        examFee: 1500,
        activityFee: 2200,
        computerFee: 1000,
        libraryFee: 500,
        transportFee: 1900,
      },

      "Class 1 - 5": {
        monthlyTuition: 3400,
        annualCharges: 7800,
        admissionFee: 6500,
        examFee: 2200,
        activityFee: 2600,
        computerFee: 1200,
        libraryFee: 700,
        transportFee: 2100,
      },

      "Class 6 - 8": {
        monthlyTuition: 4000,
        annualCharges: 8800,
        admissionFee: 7200,
        examFee: 2600,
        activityFee: 3200,
        computerFee: 1500,
        libraryFee: 800,
        transportFee: 2300,
      },

      "Class 9 - 10": {
        monthlyTuition: 4700,
        annualCharges: 9800,
        admissionFee: 8200,
        examFee: 3200,
        activityFee: 3600,
        computerFee: 1800,
        libraryFee: 1000,
        transportFee: 2500,
      },

      "Class 11 - 12": {
        monthlyTuition: 5500,
        annualCharges: 11500,
        admissionFee: 9500,
        examFee: 3600,
        activityFee: 4200,
        computerFee: 2000,
        libraryFee: 1200,
        transportFee: 2700,
      },
    },
  });

  const currentFees = feeStructures[selectedSession][selectedGroup];

  // ================================
  // CALCULATIONS
  // ================================

  const annualTuition = currentFees.monthlyTuition * 12;

  const annualTransport = currentFees.transportFee * 12;

  const oneTimeCharges =
    currentFees.annualCharges +
    currentFees.admissionFee +
    currentFees.examFee +
    currentFees.activityFee +
    currentFees.computerFee +
    currentFees.libraryFee;

  const totalAnnualFee =
    annualTuition + annualTransport + oneTimeCharges;

  // Admission fee is normally one-time.
  // This represents the regular annual cost excluding admission.
  const regularAnnualFee =
    annualTuition +
    annualTransport +
    currentFees.annualCharges +
    currentFees.examFee +
    currentFees.activityFee +
    currentFees.computerFee +
    currentFees.libraryFee;

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  // ================================
  // UPDATE FEE
  // ================================

  const updateFee = (field, value) => {
    const numericValue = Number(value);

    setFeeStructures((previous) => ({
      ...previous,
      [selectedSession]: {
        ...previous[selectedSession],
        [selectedGroup]: {
          ...previous[selectedSession][selectedGroup],
          [field]: numericValue,
        },
      },
    }));
  };

  // ================================
  // FEE TABLE
  // ================================

  const feeRows = useMemo(
    () => [
      {
        name: "Tuition Fee",
        description: "Regular monthly academic fee",
        monthly: currentFees.monthlyTuition,
        yearly: annualTuition,
        type: "Recurring",
      },
      {
        name: "Transport Fee",
        description: "School bus / transport facility",
        monthly: currentFees.transportFee,
        yearly: annualTransport,
        type: "Optional",
      },
      {
        name: "Annual Charges",
        description: "Infrastructure and annual school charges",
        monthly: 0,
        yearly: currentFees.annualCharges,
        type: "Yearly",
      },
      {
        name: "Admission / Registration",
        description: "Admission and student registration",
        monthly: 0,
        yearly: currentFees.admissionFee,
        type: "One-time",
      },
      {
        name: "Examination Fee",
        description: "Examinations and assessments",
        monthly: 0,
        yearly: currentFees.examFee,
        type: "Yearly",
      },
      {
        name: "Activity Fee",
        description: "Sports, cultural and school activities",
        monthly: 0,
        yearly: currentFees.activityFee,
        type: "Yearly",
      },
      {
        name: "Computer / Technology",
        description: "Computer lab and digital resources",
        monthly: 0,
        yearly: currentFees.computerFee,
        type: "Yearly",
      },
      {
        name: "Library Fee",
        description: "Library and learning resources",
        monthly: 0,
        yearly: currentFees.libraryFee,
        type: "Yearly",
      },
    ],
    [currentFees, annualTuition, annualTransport]
  );

  // ================================
  // EXPORT PDF
  // ================================

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="fee-page">

      {/* =========================================
          PAGE HEADER
      ========================================= */}

      <div className="fee-page-header">

        <div>
          <div className="fee-title-row">
            <h1>Fee Structure</h1>

            <span className="admin-badge">
              ADMIN
            </span>
          </div>

          <p>
            Manage class-wise school fees for each academic session.
          </p>
        </div>

        <div className="fee-header-actions">

          <button
            className="fee-export-btn"
            onClick={handleExportPDF}
          >
            ↓ Export PDF
          </button>

          <button
            className="fee-edit-btn"
            onClick={() => setShowEditModal(true)}
          >
            ✎ Edit Fees
          </button>

        </div>

      </div>

      {/* =========================================
          SESSION + CLASS FILTER
      ========================================= */}

      <div className="fee-filter-card">

        <div className="fee-filter-item">

          <label>
            Academic Session
          </label>

          <select
            value={selectedSession}
            onChange={(event) =>
              setSelectedSession(event.target.value)
            }
          >
            <option value="2026-27">
              2026 - 27
            </option>

            <option value="2027-28">
              2027 - 28
            </option>
          </select>

        </div>

        <div className="fee-filter-item">

          <label>
            Class Group
          </label>

          <select
            value={selectedGroup}
            onChange={(event) =>
              setSelectedGroup(event.target.value)
            }
          >
            {Object.keys(
              feeStructures[selectedSession]
            ).map((group) => (
              <option
                key={group}
                value={group}
              >
                {group}
              </option>
            ))}
          </select>

        </div>

        <div className="fee-session-info">

          <span>
            Currently viewing
          </span>

          <strong>
            {selectedGroup}
          </strong>

          <small>
            Session {selectedSession}
          </small>

        </div>

      </div>

      {/* =========================================
          SUMMARY CARDS
      ========================================= */}

      <div className="fee-summary-grid">

        <div className="fee-summary-box">

          <span>
            Monthly Tuition
          </span>

          <strong>
            {formatCurrency(
              currentFees.monthlyTuition
            )}
          </strong>

          <small>
            per month
          </small>

        </div>

        <div className="fee-summary-box">

          <span>
            Annual Tuition
          </span>

          <strong>
            {formatCurrency(
              annualTuition
            )}
          </strong>

          <small>
            12 months
          </small>

        </div>

        <div className="fee-summary-box">

          <span>
            Transport
          </span>

          <strong>
            {formatCurrency(
              currentFees.transportFee
            )}
          </strong>

          <small>
            per month · optional
          </small>

        </div>

        <div className="fee-summary-box highlight">

          <span>
            Total Annual Fee
          </span>

          <strong>
            {formatCurrency(
              totalAnnualFee
            )}
          </strong>

          <small>
            including admission
          </small>

        </div>

      </div>

      {/* =========================================
          MAIN FEE TABLE
      ========================================= */}

      <div className="fee-main-card">

        <div className="fee-card-heading">

          <div>

            <h2>
              {selectedGroup}
            </h2>

            <p>
              Complete fee breakdown for academic
              session{" "}
              <strong>
                {selectedSession}
              </strong>
            </p>

          </div>

          <div className="fee-status">
            ● Fee Structure Active
          </div>

        </div>

        <div className="fee-table-container">

          <table className="school-fee-table">

            <thead>

              <tr>
                <th>
                  Fee Component
                </th>

                <th>
                  Description
                </th>

                <th>
                  Monthly
                </th>

                <th>
                  Yearly
                </th>

                <th>
                  Type
                </th>
              </tr>

            </thead>

            <tbody>

              {feeRows.map((fee) => (

                <tr key={fee.name}>

                  <td>
                    <div className="fee-component-name">
                      {fee.name}
                    </div>
                  </td>

                  <td>
                    <span className="fee-description">
                      {fee.description}
                    </span>
                  </td>

                  <td>
                    {fee.monthly > 0
                      ? formatCurrency(
                          fee.monthly
                        )
                      : "—"}
                  </td>

                  <td className="yearly-amount">
                    {formatCurrency(
                      fee.yearly
                    )}
                  </td>

                  <td>

                    <span
                      className={`fee-type fee-type-${fee.type
                        .toLowerCase()
                        .replace("-", "")}`}
                    >
                      {fee.type}
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

            <tfoot>

              <tr>

                <td colSpan="2">
                  Total Estimated Annual Cost
                </td>

                <td>

                  {formatCurrency(
                    currentFees.monthlyTuition +
                      currentFees.transportFee
                  )}

                  <span className="monthly-total-label">
                    / month
                  </span>

                </td>

                <td className="total-amount">
                  {formatCurrency(
                    totalAnnualFee
                  )}
                </td>

                <td>
                  —
                </td>

              </tr>

            </tfoot>

          </table>

        </div>

      </div>

      {/* =========================================
          ANNUAL COST NOTE
      ========================================= */}

      <div className="fee-annual-note">

        <div className="fee-annual-note-icon">
          ₹
        </div>

        <div>

          <strong>
            Regular Annual Fee:{" "}
            {formatCurrency(
              regularAnnualFee
            )}
          </strong>

          <p>
            This excludes the one-time admission /
            registration charge. Transport is optional
            and is included in the estimate above.
          </p>

        </div>

      </div>

      {/* =========================================
          INFORMATION CARDS
      ========================================= */}

      <div className="fee-information-grid">

        <div className="fee-info-card">

          <div className="fee-info-icon">
            ₹
          </div>

          <div>

            <h3>
              Payment Frequency
            </h3>

            <p>
              Tuition and transport fees are
              calculated monthly. Other charges may
              be collected annually or at the time
              of admission.
            </p>

          </div>

        </div>

        <div className="fee-info-card">

          <div className="fee-info-icon">
            i
          </div>

          <div>

            <h3>
              Important Note
            </h3>

            <p>
              Transport is optional. Admission and
              registration charges generally apply
              only during new admission.
            </p>

          </div>

        </div>

      </div>

      {/* =========================================
          EDIT FEE MODAL
      ========================================= */}

      {showEditModal && (

        <div className="fee-modal-overlay">

          <div className="fee-modal">

            <div className="fee-modal-header">

              <div>

                <h2>
                  Edit Fee Structure
                </h2>

                <p>
                  {selectedGroup} ·{" "}
                  {selectedSession}
                </p>

              </div>

              <button
                className="fee-close-btn"
                onClick={() =>
                  setShowEditModal(false)
                }
              >
                ×
              </button>

            </div>

            <div className="fee-edit-grid">

              {[
                [
                  "monthlyTuition",
                  "Monthly Tuition",
                ],
                [
                  "annualCharges",
                  "Annual Charges",
                ],
                [
                  "admissionFee",
                  "Admission / Registration",
                ],
                [
                  "examFee",
                  "Examination Fee",
                ],
                [
                  "activityFee",
                  "Activity Fee",
                ],
                [
                  "computerFee",
                  "Computer / Technology",
                ],
                [
                  "libraryFee",
                  "Library Fee",
                ],
                [
                  "transportFee",
                  "Monthly Transport",
                ],
              ].map(([field, label]) => (

                <div
                  className="fee-input-group"
                  key={field}
                >

                  <label>
                    {label}
                  </label>

                  <div className="fee-input-wrapper">

                    <span>
                      ₹
                    </span>

                    <input
                      type="number"
                      min="0"
                      value={
                        currentFees[field]
                      }
                      onChange={(event) =>
                        updateFee(
                          field,
                          event.target.value
                        )
                      }
                    />

                  </div>

                </div>

              ))}

            </div>

            <div className="fee-modal-footer">

              <button
                className="fee-cancel-btn"
                onClick={() =>
                  setShowEditModal(false)
                }
              >
                Cancel
              </button>

              <button
                className="fee-save-btn"
                onClick={() =>
                  setShowEditModal(false)
                }
              >
                Save Fee Structure
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default Fee;