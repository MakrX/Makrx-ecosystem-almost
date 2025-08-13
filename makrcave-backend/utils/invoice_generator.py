import os
import io
from datetime import datetime
from typing import Dict, Any, List, Optional
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.graphics.shapes import Drawing, Rect
from reportlab.graphics import renderPDF
import qrcode
from PIL import Image as PILImage
import logging

logger = logging.getLogger(__name__)

class InvoiceGenerator:
    """PDF Invoice Generator"""
    
    def __init__(self):
        self.page_size = A4
        self.margin = 0.75 * inch
        self.styles = getSampleStyleSheet()
        self.logo_path = os.getenv("INVOICE_LOGO_PATH", "static/logo.png")
        self.company_info = {
            "name": os.getenv("COMPANY_NAME", "MakrCave"),
            "address": os.getenv("COMPANY_ADDRESS", "123 Maker Street\nTech City, TC 12345"),
            "phone": os.getenv("COMPANY_PHONE", "+91 12345 67890"),
            "email": os.getenv("COMPANY_EMAIL", "billing@makrcave.com"),
            "website": os.getenv("COMPANY_WEBSITE", "www.makrcave.com"),
            "tax_id": os.getenv("COMPANY_TAX_ID", "GST123456789")
        }
        
        # Custom styles
        self.title_style = ParagraphStyle(
            'CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            textColor=colors.HexColor('#2563eb')
        )
        
        self.heading_style = ParagraphStyle(
            'CustomHeading',
            parent=self.styles['Heading2'],
            fontSize=14,
            spaceAfter=12,
            textColor=colors.HexColor('#1f2937')
        )
        
        self.normal_style = ParagraphStyle(
            'CustomNormal',
            parent=self.styles['Normal'],
            fontSize=10,
            spaceAfter=6
        )
        
        self.small_style = ParagraphStyle(
            'CustomSmall',
            parent=self.styles['Normal'],
            fontSize=9,
            textColor=colors.HexColor('#6b7280')
        )
    
    def generate_invoice_pdf(
        self, 
        invoice_data: Dict[str, Any], 
        output_path: str = None
    ) -> bytes:
        """Generate PDF invoice and return bytes"""
        
        # Create buffer for PDF
        buffer = io.BytesIO()
        
        # Create PDF document
        doc = SimpleDocTemplate(
            buffer,
            pagesize=self.page_size,
            rightMargin=self.margin,
            leftMargin=self.margin,
            topMargin=self.margin,
            bottomMargin=self.margin
        )
        
        # Build PDF content
        story = []
        story.extend(self._build_header(invoice_data))
        story.extend(self._build_invoice_details(invoice_data))
        story.extend(self._build_billing_info(invoice_data))
        story.extend(self._build_line_items(invoice_data))
        story.extend(self._build_totals(invoice_data))
        story.extend(self._build_payment_info(invoice_data))
        story.extend(self._build_footer(invoice_data))
        
        # Build PDF
        try:
            doc.build(story)
            pdf_bytes = buffer.getvalue()
            buffer.close()
            
            # Save to file if path provided
            if output_path:
                with open(output_path, 'wb') as f:
                    f.write(pdf_bytes)
            
            return pdf_bytes
            
        except Exception as e:
            logger.error(f"PDF generation failed: {str(e)}")
            raise
    
    def _build_header(self, invoice_data: Dict[str, Any]) -> List:
        """Build invoice header with logo and company info"""
        elements = []
        
        # Create header table
        header_data = []
        
        # Logo and company info
        company_info = [
            Paragraph(f"<b>{self.company_info['name']}</b>", self.heading_style),
            Paragraph(self.company_info['address'].replace('\n', '<br/>'), self.normal_style),
            Paragraph(f"Phone: {self.company_info['phone']}", self.small_style),
            Paragraph(f"Email: {self.company_info['email']}", self.small_style),
            Paragraph(f"Website: {self.company_info['website']}", self.small_style),
        ]
        
        # Invoice title and number
        invoice_info = [
            Paragraph("INVOICE", self.title_style),
            Paragraph(f"<b>Invoice #: {invoice_data.get('invoice_number', 'N/A')}</b>", self.normal_style),
            Paragraph(f"Date: {self._format_date(invoice_data.get('issue_date'))}", self.normal_style),
            Paragraph(f"Due Date: {self._format_date(invoice_data.get('due_date'))}", self.normal_style)
        ]
        
        header_data.append([company_info, invoice_info])
        
        header_table = Table(header_data, colWidths=[3.5*inch, 3*inch])
        header_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
        ]))
        
        elements.append(header_table)
        elements.append(Spacer(1, 20))
        
        return elements
    
    def _build_invoice_details(self, invoice_data: Dict[str, Any]) -> List:
        """Build invoice details section"""
        elements = []
        
        # Add status badge
        status = invoice_data.get('status', 'draft').upper()
        status_color = {
            'PAID': colors.green,
            'PENDING': colors.orange,
            'OVERDUE': colors.red,
            'DRAFT': colors.grey
        }.get(status, colors.grey)
        
        # Status paragraph
        status_style = ParagraphStyle(
            'Status',
            parent=self.normal_style,
            textColor=status_color,
            fontSize=12,
            alignment=TA_RIGHT
        )
        
        elements.append(Paragraph(f"<b>Status: {status}</b>", status_style))
        elements.append(Spacer(1, 10))
        
        return elements
    
    def _build_billing_info(self, invoice_data: Dict[str, Any]) -> List:
        """Build billing information section"""
        elements = []
        
        # Bill To information
        bill_to_data = [
            ["Bill To:", ""],
            [f"{invoice_data.get('bill_to_name', 'N/A')}", ""],
            [f"{invoice_data.get('bill_to_email', 'N/A')}", ""],
        ]
        
        if invoice_data.get('bill_to_address'):
            bill_to_data.append([invoice_data['bill_to_address'], ""])
        
        if invoice_data.get('bill_to_phone'):
            bill_to_data.append([f"Phone: {invoice_data['bill_to_phone']}", ""])
        
        if invoice_data.get('bill_to_tax_id'):
            bill_to_data.append([f"Tax ID: {invoice_data['bill_to_tax_id']}", ""])
        
        # Company tax information
        bill_to_data.extend([
            ["", ""],
            ["From:", ""],
            [f"{self.company_info['name']}", ""],
            [f"Tax ID: {self.company_info['tax_id']}", ""]
        ])
        
        bill_to_table = Table(bill_to_data, colWidths=[3*inch, 3*inch])
        bill_to_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('FONTNAME', (0, 0), (0, 0), 'Helvetica-Bold'),
            ('FONTNAME', (0, len(bill_to_data)-3), (0, len(bill_to_data)-3), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
        ]))
        
        elements.append(bill_to_table)
        elements.append(Spacer(1, 20))
        
        return elements
    
    def _build_line_items(self, invoice_data: Dict[str, Any]) -> List:
        """Build line items table"""
        elements = []
        
        # Table header
        line_items_data = [
            ["Description", "Qty", "Unit Price", "Total"]
        ]
        
        # Add line items
        line_items = invoice_data.get('line_items', [])
        total_before_tax = 0
        
        for item in line_items:
            line_items_data.append([
                item.get('description', ''),
                str(item.get('quantity', 1)),
                self._format_currency(item.get('unit_price', 0), invoice_data.get('currency', 'INR')),
                self._format_currency(item.get('total_price', 0), invoice_data.get('currency', 'INR'))
            ])
            total_before_tax += item.get('total_price', 0)
        
        # If no line items, add the main invoice amount
        if not line_items:
            description = invoice_data.get('description', invoice_data.get('title', 'Service'))
            line_items_data.append([
                description,
                "1",
                self._format_currency(invoice_data.get('amount', 0), invoice_data.get('currency', 'INR')),
                self._format_currency(invoice_data.get('amount', 0), invoice_data.get('currency', 'INR'))
            ])
        
        # Create table
        line_items_table = Table(line_items_data, colWidths=[3*inch, 0.8*inch, 1.2*inch, 1.2*inch])
        line_items_table.setStyle(TableStyle([
            # Header row
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f3f4f6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#374151')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),  # Right align numbers
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            
            # Data rows
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9fafb')])
        ]))
        
        elements.append(line_items_table)
        elements.append(Spacer(1, 20))
        
        return elements
    
    def _build_totals(self, invoice_data: Dict[str, Any]) -> List:
        """Build totals section"""
        elements = []
        
        currency = invoice_data.get('currency', 'INR')
        
        # Totals data
        totals_data = []
        
        # Subtotal
        subtotal = invoice_data.get('amount', 0)
        totals_data.append(["Subtotal:", self._format_currency(subtotal, currency)])
        
        # Tax
        tax_amount = invoice_data.get('tax_amount', 0)
        if tax_amount > 0:
            totals_data.append(["Tax:", self._format_currency(tax_amount, currency)])
        
        # Total
        total_amount = invoice_data.get('total_amount', subtotal + tax_amount)
        totals_data.append(["", ""])  # Empty row
        totals_data.append(["<b>Total:</b>", f"<b>{self._format_currency(total_amount, currency)}</b>"])
        
        # Create totals table
        totals_table = Table(totals_data, colWidths=[4.8*inch, 1.4*inch])
        totals_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, -1), (-1, -1), 14),
            ('TEXTCOLOR', (0, -1), (-1, -1), colors.HexColor('#2563eb')),
            ('LINEABOVE', (0, -1), (-1, -1), 2, colors.HexColor('#2563eb')),
            ('TOPPADDING', (0, -1), (-1, -1), 8),
        ]))
        
        elements.append(totals_table)
        elements.append(Spacer(1, 20))
        
        return elements
    
    def _build_payment_info(self, invoice_data: Dict[str, Any]) -> List:
        """Build payment information section"""
        elements = []
        
        # Payment status
        if invoice_data.get('paid_date'):
            payment_info = f"<b>Payment Received:</b> {self._format_date(invoice_data['paid_date'])}"
            elements.append(Paragraph(payment_info, self.normal_style))
        elif invoice_data.get('due_date'):
            due_date = datetime.fromisoformat(str(invoice_data['due_date']).replace('Z', '+00:00'))
            if due_date < datetime.now(due_date.tzinfo):
                payment_info = f"<b><font color='red'>Payment Overdue</font></b> - Due: {self._format_date(invoice_data['due_date'])}"
            else:
                payment_info = f"<b>Payment Due:</b> {self._format_date(invoice_data['due_date'])}"
            elements.append(Paragraph(payment_info, self.normal_style))
        
        # Payment methods
        payment_methods = [
            "Payment can be made through:",
            "• Credit/Debit Card",
            "• UPI Payment",
            "• Bank Transfer",
            "• Net Banking"
        ]
        
        for method in payment_methods:
            elements.append(Paragraph(method, self.small_style))
        
        elements.append(Spacer(1, 20))
        
        return elements
    
    def _build_footer(self, invoice_data: Dict[str, Any]) -> List:
        """Build invoice footer"""
        elements = []
        
        # Terms and conditions
        elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e5e7eb')))
        elements.append(Spacer(1, 10))
        
        footer_text = [
            "<b>Terms & Conditions:</b>",
            "• Payment is due within 30 days of invoice date",
            "• Late payments may incur additional charges",
            "• All services are subject to our terms of service",
            "• For any billing inquiries, please contact billing@makrcave.com"
        ]
        
        for text in footer_text:
            elements.append(Paragraph(text, self.small_style))
        
        elements.append(Spacer(1, 20))
        
        # Generated timestamp
        generated_text = f"Invoice generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}"
        elements.append(Paragraph(generated_text, self.small_style))
        
        return elements
    
    def _format_date(self, date_value) -> str:
        """Format date for display"""
        if not date_value:
            return "N/A"
        
        try:
            if isinstance(date_value, str):
                # Handle ISO format strings
                date_obj = datetime.fromisoformat(date_value.replace('Z', '+00:00'))
            else:
                date_obj = date_value
            
            return date_obj.strftime("%B %d, %Y")
        except:
            return str(date_value)
    
    def _format_currency(self, amount: float, currency: str = "INR") -> str:
        """Format currency amount"""
        symbols = {
            "INR": "₹",
            "USD": "$",
            "EUR": "€",
            "GBP": "£"
        }
        
        symbol = symbols.get(currency, currency)
        return f"{symbol}{amount:,.2f}"
    
    def generate_qr_code(self, data: str, size: int = 100) -> bytes:
        """Generate QR code for payment"""
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(data)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to bytes
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        return buffer.getvalue()

# Initialize invoice generator
invoice_generator = InvoiceGenerator()

def generate_invoice_pdf(invoice_data: Dict[str, Any], output_path: str = None) -> bytes:
    """Generate PDF invoice"""
    return invoice_generator.generate_invoice_pdf(invoice_data, output_path)

def save_invoice_to_file(invoice_data: Dict[str, Any], file_path: str) -> str:
    """Save invoice PDF to file and return the path"""
    try:
        # Ensure directory exists
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        # Generate and save PDF
        pdf_bytes = generate_invoice_pdf(invoice_data)
        
        with open(file_path, 'wb') as f:
            f.write(pdf_bytes)
        
        logger.info(f"Invoice saved to {file_path}")
        return file_path
        
    except Exception as e:
        logger.error(f"Failed to save invoice: {str(e)}")
        raise

def generate_invoice_filename(invoice_number: str, makerspace_id: str = None) -> str:
    """Generate standardized invoice filename"""
    # Create directory structure: /invoices/YYYY/MM/
    now = datetime.now()
    year = now.strftime("%Y")
    month = now.strftime("%m")
    
    base_dir = os.getenv("INVOICE_STORAGE_DIR", "invoices")
    if makerspace_id:
        directory = os.path.join(base_dir, makerspace_id, year, month)
    else:
        directory = os.path.join(base_dir, year, month)
    
    filename = f"{invoice_number}.pdf"
    return os.path.join(directory, filename)
