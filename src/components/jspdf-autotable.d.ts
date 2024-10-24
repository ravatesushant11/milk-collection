// src/types/jspdf-autotable.d.ts
import "jspdf";

declare module "jspdf" {
  interface jsPDF {
    autoTable: any; // You can replace `any` with more specific types if needed
  }
}
