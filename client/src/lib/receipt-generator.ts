import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ReceiptData {
  order: {
    id: string;
    orderNumber: string;
    createdAt: string;
    deliveredAt?: string;
    product?: {
      name: string;
      weight: string;
    };
    quantity: number;
    type: string;
    unitPrice: string;
    totalAmount: string;
    paymentMethod: string;
    paymentStatus: string;
    status: string;
    notes?: string;
  };
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  address?: {
    street: string;
    city: string;
    province: string;
    zipCode: string;
  };
}

export const generateReceiptPDF = async (receiptData: ReceiptData): Promise<void> => {
  try {
    // Create a temporary container for the receipt
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    tempContainer.style.width = '400px';
    tempContainer.style.backgroundColor = 'white';
    
    // Generate receipt HTML
    const receiptHTML = generateReceiptHTML(receiptData);
    tempContainer.innerHTML = receiptHTML;
    
    document.body.appendChild(tempContainer);

    // Convert HTML to canvas
    const canvas = await html2canvas(tempContainer, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      allowTaint: true,
      width: 400,
      height: tempContainer.scrollHeight
    });

    // Remove temporary container
    document.body.removeChild(tempContainer);

    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, Math.max(120, canvas.height * 0.264583)] // Receipt paper width, auto height
    });

    // Add image to PDF
    pdf.addImage(imgData, 'PNG', 0, 0, 80, canvas.height * 0.264583);

    // Download PDF
    const filename = `GasFlow_Receipt_${receiptData.order.orderNumber}.pdf`;
    pdf.save(filename);

  } catch (error) {
    console.error('Error generating receipt PDF:', error);
    throw new Error('Failed to generate receipt PDF');
  }
};

const generateReceiptHTML = (data: ReceiptData): string => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatCurrency = (amount: string) => {
    return `₱${parseFloat(amount).toFixed(2)}`;
  };

  return `
    <div style="max-width: 380px; background: white; color: black; padding: 20px; font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.4;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="font-size: 18px; font-weight: bold; margin: 0 0 8px 0;">GASFLOW LPG</h1>
        <p style="font-size: 12px; margin: 0;">Liquefied Petroleum Gas Delivery</p>
        <p style="font-size: 10px; color: #666; margin: 4px 0 0 0;">Fast • Reliable • Safe</p>
      </div>

      <hr style="border: none; border-top: 1px solid #ccc; margin: 16px 0;">

      <!-- Receipt Info -->
      <div style="margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>Receipt #:</span>
          <span style="font-weight: bold;">${data.order.orderNumber}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>Order Date:</span>
          <span>${formatDate(data.order.createdAt)}</span>
        </div>
        ${data.order.deliveredAt ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>Delivered:</span>
          <span>${formatDate(data.order.deliveredAt)}</span>
        </div>
        ` : ''}
        <div style="display: flex; justify-content: space-between;">
          <span>Status:</span>
          <span style="text-transform: capitalize; font-weight: 600;">
            ${data.order.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <hr style="border: none; border-top: 1px solid #ccc; margin: 16px 0;">

      <!-- Customer Info -->
      <div style="margin-bottom: 16px;">
        <h3 style="font-weight: bold; margin: 0 0 8px 0; font-size: 12px;">CUSTOMER DETAILS</h3>
        <div style="font-size: 11px;">
          <div style="margin-bottom: 2px;">${data.customer.name}</div>
          <div style="margin-bottom: 2px;">${data.customer.email}</div>
          ${data.customer.phone ? `<div>${data.customer.phone}</div>` : ''}
        </div>
      </div>

      ${data.address ? `
      <!-- Delivery Address -->
      <div style="margin-bottom: 16px;">
        <h3 style="font-weight: bold; margin: 0 0 8px 0; font-size: 12px;">DELIVERY ADDRESS</h3>
        <div style="font-size: 11px;">
          <div style="margin-bottom: 2px;">${data.address.street}</div>
          <div style="margin-bottom: 2px;">${data.address.city}, ${data.address.province}</div>
          <div>${data.address.zipCode}</div>
        </div>
      </div>
      ` : ''}

      <hr style="border: none; border-top: 1px solid #ccc; margin: 16px 0;">

      <!-- Order Details -->
      <div style="margin-bottom: 16px;">
        <h3 style="font-weight: bold; margin: 0 0 8px 0; font-size: 12px;">ORDER DETAILS</h3>
        
        <div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>Product:</span>
            <span>${data.order.product?.name || 'N/A'}</span>
          </div>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>Weight:</span>
            <span>${data.order.product?.weight || 'N/A'}</span>
          </div>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>Type:</span>
            <span style="text-transform: capitalize;">${data.order.type}</span>
          </div>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>Quantity:</span>
            <span>${data.order.quantity} tank${data.order.quantity > 1 ? 's' : ''}</span>
          </div>
          
          <div style="display: flex; justify-content: space-between;">
            <span>Unit Price:</span>
            <span>${formatCurrency(data.order.unitPrice)}</span>
          </div>
        </div>
      </div>

      <hr style="border: none; border-top: 1px solid #ccc; margin: 16px 0;">

      <!-- Payment Summary -->
      <div style="margin-bottom: 16px;">
        <h3 style="font-weight: bold; margin: 0 0 8px 0; font-size: 12px;">PAYMENT SUMMARY</h3>
        
        <div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>Subtotal:</span>
            <span>${formatCurrency(data.order.totalAmount)}</span>
          </div>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>Delivery Fee:</span>
            <span>FREE</span>
          </div>
          
          <hr style="border: none; border-top: 1px solid #ccc; margin: 8px 0;">
          
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; margin-bottom: 8px;">
            <span>TOTAL:</span>
            <span>${formatCurrency(data.order.totalAmount)}</span>
          </div>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>Payment Method:</span>
            <span style="text-transform: uppercase;">${data.order.paymentMethod}</span>
          </div>
          
          <div style="display: flex; justify-content: space-between;">
            <span>Payment Status:</span>
            <span style="text-transform: capitalize; font-weight: 600; color: #16a34a;">
              ${data.order.paymentStatus}
            </span>
          </div>
        </div>
      </div>

      ${data.order.notes ? `
      <hr style="border: none; border-top: 1px solid #ccc; margin: 16px 0;">
      <div style="margin-bottom: 16px;">
        <h3 style="font-weight: bold; margin: 0 0 8px 0; font-size: 12px;">NOTES</h3>
        <p style="font-size: 11px; margin: 0;">${data.order.notes}</p>
      </div>
      ` : ''}

      <hr style="border: none; border-top: 1px solid #ccc; margin: 16px 0;">

      <!-- Footer -->
      <div style="text-align: center; font-size: 11px;">
        <p style="font-weight: bold; margin: 0 0 8px 0;">Thank you for choosing GasFlow!</p>
        <p style="margin: 0 0 4px 0;">For support, contact us at:</p>
        <p style="margin: 0 0 4px 0;">Email: support@gasflow.com</p>
        <p style="margin: 0 0 12px 0;">Phone: +63 912 345 6789</p>
        <p style="color: #666; margin: 0; font-size: 10px;">
          This is an electronic receipt.
        </p>
      </div>
    </div>
  `;
};