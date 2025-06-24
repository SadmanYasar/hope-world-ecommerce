import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Helper function to format currency values with K for thousands
export const formatCurrencyWithK = (value: number) => {
  if (value === undefined || value === null) return "$0.00";

  // Convert cents to dollars
  const dollars = value / 100;

  // Format with K suffix for values over 1000
  if (dollars >= 1000000) {
    return `$${(dollars / 1000000).toFixed(1)}M`;
  } else if (dollars >= 1000) {
    return `$${(dollars / 1000).toFixed(1)}K`;
  } else {
    return `$${dollars.toFixed(2)}`;
  }
};

// Format price/currency values consistently
export const formatPrice = (price: number | undefined) => {
  if (price === undefined || price === null) return 0;
  // If price is already in dollars (under 1000), convert to cents
  return price < 1000 ? price * 100 : price;
};

// Export dashboard to PDF
export const exportDashboardToPDF = async (
  dashboardRef: React.RefObject<HTMLDivElement>
) => {
  if (!dashboardRef.current) {
    console.error("Dashboard ref is not available");
    return;
  }

  try {
    const loadingIndicator = document.createElement("div");
    loadingIndicator.style.position = "fixed";
    loadingIndicator.style.top = "0";
    loadingIndicator.style.left = "0";
    loadingIndicator.style.width = "100%";
    loadingIndicator.style.height = "100%";
    loadingIndicator.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    loadingIndicator.style.zIndex = "9999";
    loadingIndicator.style.display = "flex";
    loadingIndicator.style.justifyContent = "center";
    loadingIndicator.style.alignItems = "center";
    loadingIndicator.style.color = "white";
    loadingIndicator.style.fontSize = "24px";
    loadingIndicator.textContent = "Generating PDF...";
    document.body.appendChild(loadingIndicator);

    // Convert each section of the dashboard to canvas
    const element = dashboardRef.current;
    const canvas = await html2canvas(element, {
      scale: 1,
      useCORS: true,
      logging: false,
      allowTaint: true,
    });

    // Calculate dimensions while maintaining aspect ratio
    const imgData = canvas.toDataURL("image/png");
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    // Create PDF
    const pdf = new jsPDF("p", "mm", "a4");
    let position = 0;

    // Add first page
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if necessary
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Generate filename with current date
    const date = new Date();
    const filename = `dashboard_export_${date.toISOString().split("T")[0]}.pdf`;

    // Save PDF
    pdf.save(filename);

    // Remove loading indicator
    document.body.removeChild(loadingIndicator);
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Failed to generate PDF. Please try again.");
  }
};
