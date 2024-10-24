import React, { useState } from "react";
import "./MilkForm.css";

interface MilkCollection {
  vendorName: string;
  fat: number;
  snf: number;
  litreQuantity: number;
  milkType: "cow" | "buffalo";
  timeOfDay: "morning" | "evening";
  date: string;
  price: number;
  cowRate: number;
  buffaloRate: number;
}

const initialFormState: MilkCollection = {
  vendorName: "",
  fat: 0,
  snf: 0,
  litreQuantity: 0,
  milkType: "cow",
  timeOfDay: "morning",
  date: "",
  price: 0,
  cowRate: 9, // default rate for cow milk
  buffaloRate: 9.5, // default rate for buffalo milk
};

const MilkForm: React.FC = () => {
  const [formData, setFormData] = useState<MilkCollection>(initialFormState);
  const [savedRecords, setSavedRecords] = useState<MilkCollection[]>(() => {
    const storedData = localStorage.getItem("milkRecords");
    return storedData ? JSON.parse(storedData) : [];
  });

  const calculatePrice = (
    fat: number,
    snf: number,
    milkType: "cow" | "buffalo",
    quantity: number,
    cowRate: number,
    buffaloRate: number
  ): number => {
    const rate = milkType === "cow" ? cowRate : buffaloRate;
    let pricePerLitre = fat * rate;

    if (snf < 8.5) {
      pricePerLitre -= 0.5;
    }

    return pricePerLitre * quantity;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "fat" ||
        name === "snf" ||
        name === "litreQuantity" ||
        name === "price" ||
        name === "cowRate" ||
        name === "buffaloRate"
          ? parseFloat(value)
          : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = calculatePrice(
      formData.fat,
      formData.snf,
      formData.milkType,
      formData.litreQuantity,
      formData.cowRate,
      formData.buffaloRate
    );
    const newRecord = { ...formData, price };
    const newRecords = [...savedRecords, newRecord];
    setSavedRecords(newRecords);
    localStorage.setItem("milkRecords", JSON.stringify(newRecords));
    setFormData(initialFormState);
  };

  return (
    <div className="milk-form-container">
      <form className="milk-main-form" onSubmit={handleSubmit}>
        <div>
          <label>Date:</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label>Time of Day:</label>
          <select
            name="timeOfDay"
            value={formData.timeOfDay}
            onChange={handleInputChange}
            required
          >
            <option value="morning">Morning</option>
            <option value="evening">Evening</option>
          </select>
        </div>

        <div>
          <label>Vendor Name:</label>
          <input
            type="text"
            name="vendorName"
            placeholder="Enter name here..."
            value={formData.vendorName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label>Litre Quantity:</label>
          <input
            type="number"
            name="litreQuantity"
            value={formData.litreQuantity}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label>Milk Type:</label>
          <select
            name="milkType"
            value={formData.milkType}
            onChange={handleInputChange}
            required
          >
            <option value="cow">Cow</option>
            <option value="buffalo">Buffalo</option>
          </select>
        </div>

        {/* Conditionally show the rate field based on milk type */}
        {formData.milkType === "cow" && (
          <div>
            <label>Cow Milk Fat Rate:</label>
            <input
              type="number"
              name="cowRate"
              value={formData.cowRate}
              onChange={handleInputChange}
              required
            />
          </div>
        )}

        {formData.milkType === "buffalo" && (
          <div>
            <label>Buffalo Milk Fat Rate:</label>
            <input
              type="number"
              name="buffaloRate"
              value={formData.buffaloRate}
              onChange={handleInputChange}
              required
            />
          </div>
        )}

        <div>
          <label>Fat %:</label>
          <input
            type="number"
            name="fat"
            value={formData.fat}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label>SNF %:</label>
          <input
            type="number"
            name="snf"
            value={formData.snf}
            onChange={handleInputChange}
            required
          />
        </div>
        <button type="submit">Add Vendor Details</button>
      </form>
    </div>
  );
};

export default MilkForm;
