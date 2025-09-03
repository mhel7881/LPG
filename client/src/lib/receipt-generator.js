var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
export var generateReceiptPDF = function (receiptData) { return __awaiter(void 0, void 0, void 0, function () {
    var tempContainer, receiptHTML, canvas, imgData, pdf, filename, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                tempContainer = document.createElement('div');
                tempContainer.style.position = 'absolute';
                tempContainer.style.left = '-9999px';
                tempContainer.style.top = '-9999px';
                tempContainer.style.width = '400px';
                tempContainer.style.backgroundColor = 'white';
                receiptHTML = generateReceiptHTML(receiptData);
                tempContainer.innerHTML = receiptHTML;
                document.body.appendChild(tempContainer);
                return [4 /*yield*/, html2canvas(tempContainer, {
                        backgroundColor: '#ffffff',
                        scale: 2,
                        useCORS: true,
                        allowTaint: true,
                        width: 400,
                        height: tempContainer.scrollHeight
                    })];
            case 1:
                canvas = _a.sent();
                // Remove temporary container
                document.body.removeChild(tempContainer);
                imgData = canvas.toDataURL('image/png');
                pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: [80, Math.max(120, canvas.height * 0.264583)] // Receipt paper width, auto height
                });
                // Add image to PDF
                pdf.addImage(imgData, 'PNG', 0, 0, 80, canvas.height * 0.264583);
                filename = "GasFlow_Receipt_".concat(receiptData.order.orderNumber, ".pdf");
                pdf.save(filename);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('Error generating receipt PDF:', error_1);
                throw new Error('Failed to generate receipt PDF');
            case 3: return [2 /*return*/];
        }
    });
}); };
var generateReceiptHTML = function (data) {
    var _a, _b;
    var formatDate = function (dateString) {
        return new Date(dateString).toLocaleString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };
    var formatCurrency = function (amount) {
        return "\u20B1".concat(parseFloat(amount).toFixed(2));
    };
    return "\n    <div style=\"max-width: 380px; background: white; color: black; padding: 20px; font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.4;\">\n      <!-- Header -->\n      <div style=\"text-align: center; margin-bottom: 20px;\">\n        <h1 style=\"font-size: 18px; font-weight: bold; margin: 0 0 8px 0;\">GASFLOW LPG</h1>\n        <p style=\"font-size: 12px; margin: 0;\">Liquefied Petroleum Gas Delivery</p>\n        <p style=\"font-size: 10px; color: #666; margin: 4px 0 0 0;\">Fast \u2022 Reliable \u2022 Safe</p>\n      </div>\n\n      <hr style=\"border: none; border-top: 1px solid #ccc; margin: 16px 0;\">\n\n      <!-- Receipt Info -->\n      <div style=\"margin-bottom: 16px;\">\n        <div style=\"display: flex; justify-content: space-between; margin-bottom: 4px;\">\n          <span>Receipt #:</span>\n          <span style=\"font-weight: bold;\">".concat(data.order.orderNumber, "</span>\n        </div>\n        <div style=\"display: flex; justify-content: space-between; margin-bottom: 4px;\">\n          <span>Order Date:</span>\n          <span>").concat(formatDate(data.order.createdAt), "</span>\n        </div>\n        ").concat(data.order.deliveredAt ? "\n        <div style=\"display: flex; justify-content: space-between; margin-bottom: 4px;\">\n          <span>Delivered:</span>\n          <span>".concat(formatDate(data.order.deliveredAt), "</span>\n        </div>\n        ") : '', "\n        <div style=\"display: flex; justify-content: space-between;\">\n          <span>Status:</span>\n          <span style=\"text-transform: capitalize; font-weight: 600;\">\n            ").concat(data.order.status.replace('_', ' '), "\n          </span>\n        </div>\n      </div>\n\n      <hr style=\"border: none; border-top: 1px solid #ccc; margin: 16px 0;\">\n\n      <!-- Customer Info -->\n      <div style=\"margin-bottom: 16px;\">\n        <h3 style=\"font-weight: bold; margin: 0 0 8px 0; font-size: 12px;\">CUSTOMER DETAILS</h3>\n        <div style=\"font-size: 11px;\">\n          <div style=\"margin-bottom: 2px;\">").concat(data.customer.name, "</div>\n          <div style=\"margin-bottom: 2px;\">").concat(data.customer.email, "</div>\n          ").concat(data.customer.phone ? "<div>".concat(data.customer.phone, "</div>") : '', "\n        </div>\n      </div>\n\n      ").concat(data.address ? "\n      <!-- Delivery Address -->\n      <div style=\"margin-bottom: 16px;\">\n        <h3 style=\"font-weight: bold; margin: 0 0 8px 0; font-size: 12px;\">DELIVERY ADDRESS</h3>\n        <div style=\"font-size: 11px;\">\n          <div style=\"margin-bottom: 2px;\">".concat(data.address.street, "</div>\n          <div style=\"margin-bottom: 2px;\">").concat(data.address.city, ", ").concat(data.address.province, "</div>\n          <div>").concat(data.address.zipCode, "</div>\n        </div>\n      </div>\n      ") : '', "\n\n      <hr style=\"border: none; border-top: 1px solid #ccc; margin: 16px 0;\">\n\n      <!-- Order Details -->\n      <div style=\"margin-bottom: 16px;\">\n        <h3 style=\"font-weight: bold; margin: 0 0 8px 0; font-size: 12px;\">ORDER DETAILS</h3>\n        \n        <div>\n          <div style=\"display: flex; justify-content: space-between; margin-bottom: 4px;\">\n            <span>Product:</span>\n            <span>").concat(((_a = data.order.product) === null || _a === void 0 ? void 0 : _a.name) || 'N/A', "</span>\n          </div>\n          \n          <div style=\"display: flex; justify-content: space-between; margin-bottom: 4px;\">\n            <span>Weight:</span>\n            <span>").concat(((_b = data.order.product) === null || _b === void 0 ? void 0 : _b.weight) || 'N/A', "</span>\n          </div>\n          \n          <div style=\"display: flex; justify-content: space-between; margin-bottom: 4px;\">\n            <span>Type:</span>\n            <span style=\"text-transform: capitalize;\">").concat(data.order.type, "</span>\n          </div>\n          \n          <div style=\"display: flex; justify-content: space-between; margin-bottom: 4px;\">\n            <span>Quantity:</span>\n            <span>").concat(data.order.quantity, " tank").concat(data.order.quantity > 1 ? 's' : '', "</span>\n          </div>\n          \n          <div style=\"display: flex; justify-content: space-between;\">\n            <span>Unit Price:</span>\n            <span>").concat(formatCurrency(data.order.unitPrice), "</span>\n          </div>\n        </div>\n      </div>\n\n      <hr style=\"border: none; border-top: 1px solid #ccc; margin: 16px 0;\">\n\n      <!-- Payment Summary -->\n      <div style=\"margin-bottom: 16px;\">\n        <h3 style=\"font-weight: bold; margin: 0 0 8px 0; font-size: 12px;\">PAYMENT SUMMARY</h3>\n        \n        <div>\n          <div style=\"display: flex; justify-content: space-between; margin-bottom: 4px;\">\n            <span>Subtotal:</span>\n            <span>").concat(formatCurrency(data.order.totalAmount), "</span>\n          </div>\n          \n          <div style=\"display: flex; justify-content: space-between; margin-bottom: 8px;\">\n            <span>Delivery Fee:</span>\n            <span>FREE</span>\n          </div>\n          \n          <hr style=\"border: none; border-top: 1px solid #ccc; margin: 8px 0;\">\n          \n          <div style=\"display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; margin-bottom: 8px;\">\n            <span>TOTAL:</span>\n            <span>").concat(formatCurrency(data.order.totalAmount), "</span>\n          </div>\n          \n          <div style=\"display: flex; justify-content: space-between; margin-bottom: 4px;\">\n            <span>Payment Method:</span>\n            <span style=\"text-transform: uppercase;\">").concat(data.order.paymentMethod, "</span>\n          </div>\n          \n          <div style=\"display: flex; justify-content: space-between;\">\n            <span>Payment Status:</span>\n            <span style=\"text-transform: capitalize; font-weight: 600; color: #16a34a;\">\n              ").concat(data.order.paymentStatus, "\n            </span>\n          </div>\n        </div>\n      </div>\n\n      ").concat(data.order.notes ? "\n      <hr style=\"border: none; border-top: 1px solid #ccc; margin: 16px 0;\">\n      <div style=\"margin-bottom: 16px;\">\n        <h3 style=\"font-weight: bold; margin: 0 0 8px 0; font-size: 12px;\">NOTES</h3>\n        <p style=\"font-size: 11px; margin: 0;\">".concat(data.order.notes, "</p>\n      </div>\n      ") : '', "\n\n      <hr style=\"border: none; border-top: 1px solid #ccc; margin: 16px 0;\">\n\n      <!-- Footer -->\n      <div style=\"text-align: center; font-size: 11px;\">\n        <p style=\"font-weight: bold; margin: 0 0 8px 0;\">Thank you for choosing GasFlow!</p>\n        <p style=\"margin: 0 0 4px 0;\">For support, contact us at:</p>\n        <p style=\"margin: 0 0 4px 0;\">Email: support@gasflow.com</p>\n        <p style=\"margin: 0 0 12px 0;\">Phone: +63 912 345 6789</p>\n        <p style=\"color: #666; margin: 0; font-size: 10px;\">\n          This is an electronic receipt.\n        </p>\n      </div>\n    </div>\n  ");
};
