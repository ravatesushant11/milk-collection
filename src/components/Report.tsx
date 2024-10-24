import React, { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "./Report.css";
import Navbar from "./NavBar";

// Define the structure of a milk collection record
interface MilkCollectionRecord {
  date: string;
  vendorName: string;
  fat: number;
  snf: number;
  litreQuantity: number;
  milkType: "cow" | "buffalo";
  timeOfDay: "morning" | "evening";
  price: number;
  cowRate: number;
  buffaloRate: number;
}

const Report: React.FC = () => {
  const [records, setRecords] = useState<MilkCollectionRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<MilkCollectionRecord | null>(
    null
  );

  useEffect(() => {
    const storedRecords = localStorage.getItem("milkRecords");
    if (storedRecords) {
      const parsedRecords = JSON.parse(storedRecords).map(
        (record: MilkCollectionRecord) => ({
          ...record,
          price: calculatePrice(
            record.fat,
            record.snf,
            record.milkType,
            record.litreQuantity,
            record.cowRate,
            record.buffaloRate
          ),
        })
      );
      setRecords(parsedRecords);
    }
  }, []);

  const calculatePrice = (
    fat: number,
    snf: number,
    milkType: "cow" | "buffalo",
    quantity: number,
    cowRate: number,
    buffaloRate: number
  ) => {
    let pricePerLitre = milkType === "cow" ? cowRate : buffaloRate;

    // Adjust price based on fat percentage
    pricePerLitre *= fat; // Assuming fat percentage affects the price

    // Apply SNF deduction if less than 8.5
    if (snf < 8.5) {
      pricePerLitre -= 0.5;
    }

    // Calculate total price
    return pricePerLitre * quantity;
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "startDate") {
      setStartDate(value);
    } else {
      setEndDate(value);
    }
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditFormData({ ...records[index] });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (editFormData) {
      const newData = {
        ...editFormData,
        [e.target.name]:
          e.target.type === "number"
            ? parseFloat(e.target.value)
            : e.target.value,
      };

      // Recalculate the price using the updated values
      newData.price = calculatePrice(
        newData.fat,
        newData.snf,
        newData.milkType,
        newData.litreQuantity,
        newData.cowRate,
        newData.buffaloRate
      );
      setEditFormData(newData);
    }
  };

  const handleSave = () => {
    if (editFormData) {
      const updatedRecords = [...records];
      updatedRecords[editingIndex!] = editFormData;
      localStorage.setItem("milkRecords", JSON.stringify(updatedRecords));
      setRecords(updatedRecords);
      setEditingIndex(null);
      setEditFormData(null);
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditFormData(null);
  };

  const handleDelete = (index: number) => {
    const updatedRecords = records.filter((_, i) => i !== index);
    setRecords(updatedRecords);
    localStorage.setItem("milkRecords", JSON.stringify(updatedRecords));
  };

  const handleGeneratePDF = () => {
    const filteredRecords = records.filter((record) => {
      const matchesVendor = record.vendorName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStartDate =
        !startDate || new Date(record.date) >= new Date(startDate);
      const matchesEndDate =
        !endDate || new Date(record.date) <= new Date(endDate);
      return matchesVendor && matchesStartDate && matchesEndDate;
    });

    if (filteredRecords.length === 0) {
      alert("No records found for the given filters.");
      return;
    }

    const totalAmount = filteredRecords.reduce(
      (sum, record) => sum + (record.price || 0),
      0
    );
    const doc = new jsPDF();
    const tableData = filteredRecords.map((record) => [
      record.date,
      record.timeOfDay === "morning" ? "Morning" : "Evening",
      record.vendorName,
      formatValue(record.fat),
      formatValue(record.snf),
      `${record.litreQuantity} L`,
      record.milkType === "cow" ? "Cow" : "Buffalo",
      record.milkType === "cow" ? formatValue(record.cowRate) : "N/A",
      record.milkType === "buffalo" ? formatValue(record.buffaloRate) : "N/A",
      `RS ${formatValue(record.price)}`,
    ]);

    autoTable(doc, {
      head: [
        [
          "Date",
          "Time of Day",
          "Vendor Name",
          "Fat %",
          "SNF %",
          "Litre Qty",
          "Milk Type",
          "Cow Fat Rate",
          "Buffalo Fat Rate",
          "Amount in Rupees",
        ],
      ],
      body: tableData,
    });

    doc.text(
      `Total Amount: ${totalAmount.toFixed(2)} Rs`,
      14,
      doc.autoTable.previous.finalY + 10
    );
    doc.save("milk_records.pdf");
  };

  const filteredRecords = records.filter((record) => {
    const matchesVendor = record.vendorName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStartDate =
      !startDate || new Date(record.date) >= new Date(startDate);
    const matchesEndDate =
      !endDate || new Date(record.date) <= new Date(endDate);
    return matchesVendor && matchesStartDate && matchesEndDate;
  });

  const totalAmount = filteredRecords.reduce(
    (sum, record) => sum + (record.price || 0),
    0
  );

  const formatValue = (value: number | undefined) =>
    value !== undefined && value !== null ? value.toFixed(2) : "N/A";

  return (
    <div className="report-container">
      <Navbar />
      <h2>Milk Collection Report</h2>
      <div className="search-box">
        <input
          type="text"
          placeholder="Search by Vendor Name"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        &nbsp; From
        <input
          type="date"
          name="startDate"
          value={startDate}
          onChange={handleDateChange}
        />
        &nbsp; To
        <input
          type="date"
          name="endDate"
          value={endDate}
          onChange={handleDateChange}
        />
        <button
          style={{ background: "#3a89decc" }}
          className="generate-pdf-btn"
          onClick={handleGeneratePDF}
        >
          Generate PDF
        </button>
      </div>

      <div className="vendor-cards">
        {filteredRecords.map((record, index) => (
          <div key={index} className="vendor-card">
            {editingIndex === index ? (
              <div className="edit-form">
                <label>Date:</label>
                <input
                  type="date"
                  name="date"
                  value={editFormData?.date}
                  onChange={handleInputChange}
                />
                <label>Time of Day:</label>
                <select
                  name="timeOfDay"
                  value={editFormData?.timeOfDay}
                  onChange={handleInputChange}
                >
                  <option value="morning">Morning</option>
                  <option value="evening">Evening</option>
                </select>
                <label>Vendor Name:</label>
                <input
                  type="text"
                  name="vendorName"
                  value={editFormData?.vendorName}
                  onChange={handleInputChange}
                />
                <label>Fat %:</label>
                <input
                  type="number"
                  name="fat"
                  value={editFormData?.fat || ""}
                  onChange={handleInputChange}
                />
                <label>SNF %:</label>
                <input
                  type="number"
                  name="snf"
                  value={editFormData?.snf || ""}
                  onChange={handleInputChange}
                />
                <label>Litre Quantity:</label>
                <input
                  type="number"
                  name="litreQuantity"
                  value={editFormData?.litreQuantity || ""}
                  onChange={handleInputChange}
                />
                <label>Milk Type:</label>
                <select
                  name="milkType"
                  value={editFormData?.milkType}
                  onChange={handleInputChange}
                >
                  <option value="cow">Cow</option>
                  <option value="buffalo">Buffalo</option>
                </select>
                <label>Cow Rate:</label>
                <input
                  type="number"
                  name="cowRate"
                  value={editFormData?.cowRate || ""}
                  onChange={handleInputChange}
                />
                <label>Buffalo Rate:</label>
                <input
                  type="number"
                  name="buffaloRate"
                  value={editFormData?.buffaloRate || ""}
                  onChange={handleInputChange}
                />
                <label>Price:</label>
                <input
                  type="text"
                  name="price"
                  value={formatValue(editFormData?.price)}
                  readOnly
                />
                <button onClick={handleSave}>Save</button>
                <button onClick={handleCancel}>Cancel</button>
              </div>
            ) : (
              <div className="vendor-info">
                <p>
                  <span>Date:</span> {record.date}
                </p>
                <p>
                  <span>Time of Day: </span>
                  {record.timeOfDay === "morning" ? "Morning" : "Evening"}
                </p>
                <p>
                  <span>Vendor Name: </span>
                  {record.vendorName}
                </p>
                <p>
                  <span>Fat %:</span> {formatValue(record.fat)}
                </p>
                <p>
                  <span>SNF %:</span> {formatValue(record.snf)}
                </p>
                <p>
                  <span>Litre Quantity:</span> {record.litreQuantity} L
                </p>
                <p>
                  <span>Milk Type:</span>{" "}
                  {record.milkType === "cow" ? "Cow" : "Buffalo"}
                </p>
                <p>
                  <span>Cow Rate:</span> {formatValue(record.cowRate)}
                </p>
                <p>
                  <span>Buffalo Rate:</span> {formatValue(record.buffaloRate)}
                </p>
                <p>
                  <span>Price:</span> Rs {formatValue(record.price)}
                </p>
                <div className="vendor-card-btns">
                  <button onClick={() => handleEdit(index)}>Edit</button>
                  <button onClick={() => handleDelete(index)}>Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="total-amount">
        <p>Total Amount: {totalAmount.toFixed(2)} Rs</p>
      </div>
    </div>
  );
};

export default Report;
