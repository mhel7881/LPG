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
import nodemailer from 'nodemailer';
import crypto from 'crypto';
var EmailService = /** @class */ (function () {
    function EmailService() {
        var config = {
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.EMAIL_PORT || '587'),
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER || '',
                pass: process.env.EMAIL_PASS || '',
            },
        };
        this.transporter = nodemailer.createTransport(config);
    }
    EmailService.prototype.sendVerificationEmail = function (email, token) {
        return __awaiter(this, void 0, void 0, function () {
            var verificationUrl, mailOptions, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        verificationUrl = "".concat(process.env.FRONTEND_URL, "/verify-email?token=").concat(token);
                        mailOptions = {
                            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
                            to: email,
                            subject: 'Verify Your Email - GasFlow',
                            html: "\n        <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\">\n          <h2 style=\"color: #333; text-align: center;\">Welcome to GasFlow!</h2>\n          <p style=\"color: #666; line-height: 1.6;\">\n            Thank you for registering with GasFlow. Please verify your email address by clicking the button below:\n          </p>\n          <div style=\"text-align: center; margin: 30px 0;\">\n            <a href=\"".concat(verificationUrl, "\"\n               style=\"background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;\">\n              Verify Email Address\n            </a>\n          </div>\n          <p style=\"color: #666; line-height: 1.6;\">\n            If the button doesn't work, you can also copy and paste this link into your browser:\n          </p>\n          <p style=\"word-break: break-all; color: #007bff;\">\n            ").concat(verificationUrl, "\n          </p>\n          <p style=\"color: #999; font-size: 12px;\">\n            This link will expire in 24 hours.\n          </p>\n          <hr style=\"border: none; border-top: 1px solid #eee; margin: 20px 0;\">\n          <p style=\"color: #666; text-align: center;\">\n            If you didn't create an account with GasFlow, please ignore this email.\n          </p>\n        </div>\n      "),
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.transporter.sendMail(mailOptions)];
                    case 2:
                        _a.sent();
                        console.log("Verification email sent to ".concat(email));
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Error sending verification email:', error_1);
                        throw new Error('Failed to send verification email');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    EmailService.prototype.sendPasswordResetEmail = function (email, token) {
        return __awaiter(this, void 0, void 0, function () {
            var resetUrl, mailOptions, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        resetUrl = "".concat(process.env.FRONTEND_URL, "/reset-password?token=").concat(token);
                        mailOptions = {
                            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
                            to: email,
                            subject: 'Reset Your Password - GasFlow',
                            html: "\n        <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\">\n          <h2 style=\"color: #333; text-align: center;\">Reset Your Password</h2>\n          <p style=\"color: #666; line-height: 1.6;\">\n            You requested a password reset for your GasFlow account. Click the button below to reset your password:\n          </p>\n          <div style=\"text-align: center; margin: 30px 0;\">\n            <a href=\"".concat(resetUrl, "\"\n               style=\"background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;\">\n              Reset Password\n            </a>\n          </div>\n          <p style=\"color: #666; line-height: 1.6;\">\n            If the button doesn't work, you can also copy and paste this link into your browser:\n          </p>\n          <p style=\"word-break: break-all; color: #dc3545;\">\n            ").concat(resetUrl, "\n          </p>\n          <p style=\"color: #999; font-size: 12px;\">\n            This link will expire in 1 hour.\n          </p>\n          <hr style=\"border: none; border-top: 1px solid #eee; margin: 20px 0;\">\n          <p style=\"color: #666; text-align: center;\">\n            If you didn't request a password reset, please ignore this email.\n          </p>\n        </div>\n      "),
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.transporter.sendMail(mailOptions)];
                    case 2:
                        _a.sent();
                        console.log("Password reset email sent to ".concat(email));
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        console.error('Error sending password reset email:', error_2);
                        throw new Error('Failed to send password reset email');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    EmailService.prototype.generateVerificationToken = function () {
        return crypto.randomBytes(32).toString('hex');
    };
    EmailService.prototype.generatePasswordResetToken = function () {
        return crypto.randomBytes(32).toString('hex');
    };
    return EmailService;
}());
export var emailService = new EmailService();
