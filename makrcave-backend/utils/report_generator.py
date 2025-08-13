import pandas as pd
import io
import os
from datetime import datetime, date
from typing import Dict, List, Any, Optional
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.charts.lineplots import LinePlot
from reportlab.graphics.charts.piecharts import Pie
from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.graphics.widgetbase import Widget
from sqlalchemy.orm import Session
import openpyxl  # noqa: F401 - required for Excel export engine

class ReportGenerator:
    def __init__(self, db: Session):
        self.db = db
        self.styles = getSampleStyleSheet()
        self.title_style = ParagraphStyle(
            'CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=18,
            spaceAfter=30,
            textColor=colors.HexColor('#1f2937')
        )
        self.subtitle_style = ParagraphStyle(
            'CustomSubtitle',
            parent=self.styles['Heading2'],
            fontSize=14,
            spaceAfter=20,
            textColor=colors.HexColor('#374151')
        )

    def generate_usage_report_csv(self, makerspace_id: str, start_date: date, end_date: date) -> str:
        """Generate usage analytics CSV report"""
        # Query usage events
        from models.analytics import UsageEvent
        
        events = self.db.query(UsageEvent).filter(
            UsageEvent.makerspace_id == makerspace_id,
            UsageEvent.timestamp >= start_date,
            UsageEvent.timestamp <= end_date
        ).all()
        
        # Convert to DataFrame
        data = []
        for event in events:
            data.append({
                'Date': event.timestamp.strftime('%Y-%m-%d'),
                'Time': event.timestamp.strftime('%H:%M:%S'),
                'Event Type': event.event_type,
                'User ID': str(event.user_id) if event.user_id else 'System',
                'Resource Type': event.resource_type or 'N/A',
                'Resource ID': str(event.resource_id) if event.resource_id else 'N/A',
                'Duration (minutes)': event.duration_minutes or 0,
                'Metadata': str(event.metadata) if event.metadata else ''
            })
        
        df = pd.DataFrame(data)
        
        # Generate summary statistics
        summary_data = []
        summary_data.append(['Total Events', len(df)])
        summary_data.append(['Date Range', f"{start_date} to {end_date}"])
        summary_data.append(['Most Common Event', df['Event Type'].mode().iloc[0] if not df.empty else 'N/A'])
        summary_data.append(['Total Duration (hours)', round(df['Duration (minutes)'].sum() / 60, 2)])
        
        # Save to CSV
        filename = f"usage_report_{makerspace_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        filepath = os.path.join("/tmp", filename)
        
        with open(filepath, 'w') as f:
            f.write("# USAGE ANALYTICS REPORT\n")
            f.write(f"# Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"# Makerspace ID: {makerspace_id}\n")
            f.write(f"# Period: {start_date} to {end_date}\n")
            f.write("\n# SUMMARY\n")
            for summary_item in summary_data:
                f.write(f"# {summary_item[0]}: {summary_item[1]}\n")
            f.write("\n")
        
        df.to_csv(filepath, mode='a', index=False)
        return filepath

    def generate_inventory_report_xlsx(self, makerspace_id: str, start_date: date, end_date: date) -> str:
        """Generate inventory analytics Excel report"""
        from models.analytics import InventoryAnalytics
        
        # Query inventory data
        inventory_data = self.db.query(InventoryAnalytics).filter(
            InventoryAnalytics.makerspace_id == makerspace_id,
            InventoryAnalytics.date >= start_date,
            InventoryAnalytics.date <= end_date
        ).all()
        
        filename = f"inventory_report_{makerspace_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
        filepath = os.path.join("/tmp", filename)
        
        with pd.ExcelWriter(filepath, engine='openpyxl') as writer:
            # Summary sheet
            summary_data = {
                'Metric': ['Total Items Tracked', 'Total Consumed', 'Total Cost', 'Average Daily Consumption'],
                'Value': [
                    len(set(item.inventory_item_id for item in inventory_data)),
                    sum(item.consumed_quantity for item in inventory_data),
                    f"${sum(item.total_cost_consumed or 0 for item in inventory_data):.2f}",
                    f"{sum(item.consumed_quantity for item in inventory_data) / max(len(set(item.date for item in inventory_data)), 1):.2f}"
                ]
            }
            pd.DataFrame(summary_data).to_excel(writer, sheet_name='Summary', index=False)
            
            # Detailed data sheet
            detailed_data = []
            for item in inventory_data:
                detailed_data.append({
                    'Date': item.date,
                    'Item ID': str(item.inventory_item_id),
                    'Starting Quantity': item.starting_quantity,
                    'Consumed': item.consumed_quantity,
                    'Restocked': item.restocked_quantity,
                    'Ending Quantity': item.ending_quantity,
                    'Cost per Unit': item.cost_per_unit or 0,
                    'Total Cost Consumed': item.total_cost_consumed or 0,
                    'Consumption Rate': item.consumption_rate or 0,
                    'Projects Using': item.projects_using,
                    'Reorder Triggered': item.reorder_triggered
                })
            
            pd.DataFrame(detailed_data).to_excel(writer, sheet_name='Detailed Data', index=False)
            
            # Top consumers sheet
            consumption_by_item = {}
            for item in inventory_data:
                item_id = str(item.inventory_item_id)
                if item_id not in consumption_by_item:
                    consumption_by_item[item_id] = {'consumed': 0, 'cost': 0}
                consumption_by_item[item_id]['consumed'] += item.consumed_quantity
                consumption_by_item[item_id]['cost'] += item.total_cost_consumed or 0
            
            top_consumers = sorted(consumption_by_item.items(), key=lambda x: x[1]['consumed'], reverse=True)[:20]
            top_consumer_data = [
                {'Item ID': item_id, 'Total Consumed': data['consumed'], 'Total Cost': f"${data['cost']:.2f}"}
                for item_id, data in top_consumers
            ]
            pd.DataFrame(top_consumer_data).to_excel(writer, sheet_name='Top Consumers', index=False)
        
        return filepath

    def generate_revenue_report_pdf(self, makerspace_id: str, start_date: date, end_date: date) -> str:
        """Generate revenue analytics PDF report"""
        from models.analytics import RevenueAnalytics
        
        # Query revenue data
        revenue_data = self.db.query(RevenueAnalytics).filter(
            RevenueAnalytics.makerspace_id == makerspace_id,
            RevenueAnalytics.date >= start_date,
            RevenueAnalytics.date <= end_date
        ).all()
        
        filename = f"revenue_report_{makerspace_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        filepath = os.path.join("/tmp", filename)
        
        doc = SimpleDocTemplate(filepath, pagesize=A4)
        elements = []
        
        # Title
        title = Paragraph(f"Revenue Analytics Report", self.title_style)
        elements.append(title)
        elements.append(Spacer(1, 20))
        
        # Report info
        info_data = [
            ['Report Period:', f"{start_date} to {end_date}"],
            ['Generated On:', datetime.now().strftime('%Y-%m-%d %H:%M:%S')],
            ['Makerspace ID:', makerspace_id]
        ]
        info_table = Table(info_data, colWidths=[2*inch, 4*inch])
        info_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ]))
        elements.append(info_table)
        elements.append(Spacer(1, 30))
        
        # Summary metrics
        total_revenue = sum(item.amount for item in revenue_data)
        revenue_by_type = {}
        revenue_by_method = {}
        
        for item in revenue_data:
            revenue_by_type[item.revenue_type] = revenue_by_type.get(item.revenue_type, 0) + item.amount
            payment_method = item.payment_method or 'Unknown'
            revenue_by_method[payment_method] = revenue_by_method.get(payment_method, 0) + item.amount
        
        summary_title = Paragraph("Executive Summary", self.subtitle_style)
        elements.append(summary_title)
        
        summary_data = [
            ['Metric', 'Value'],
            ['Total Revenue', f"${total_revenue:.2f}"],
            ['Number of Transactions', str(len(revenue_data))],
            ['Average Transaction', f"${total_revenue / len(revenue_data):.2f}" if revenue_data else "$0.00"],
            ['Top Revenue Source', max(revenue_by_type.items(), key=lambda x: x[1])[0] if revenue_by_type else 'N/A'],
            ['Most Used Payment Method', max(revenue_by_method.items(), key=lambda x: x[1])[0] if revenue_by_method else 'N/A']
        ]
        
        summary_table = Table(summary_data, colWidths=[3*inch, 2*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(summary_table)
        elements.append(Spacer(1, 30))
        
        # Revenue by type breakdown
        breakdown_title = Paragraph("Revenue Breakdown by Type", self.subtitle_style)
        elements.append(breakdown_title)
        
        breakdown_data = [['Revenue Type', 'Amount', 'Percentage']]
        for revenue_type, amount in sorted(revenue_by_type.items(), key=lambda x: x[1], reverse=True):
            percentage = (amount / total_revenue * 100) if total_revenue > 0 else 0
            breakdown_data.append([revenue_type.title(), f"${amount:.2f}", f"{percentage:.1f}%"])
        
        breakdown_table = Table(breakdown_data, colWidths=[2*inch, 1.5*inch, 1.5*inch])
        breakdown_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(breakdown_table)
        elements.append(Spacer(1, 30))
        
        # Monthly trend (if data spans multiple months)
        monthly_revenue = {}
        for item in revenue_data:
            month_key = item.date.strftime('%Y-%m')
            monthly_revenue[month_key] = monthly_revenue.get(month_key, 0) + item.amount
        
        if len(monthly_revenue) > 1:
            trend_title = Paragraph("Monthly Revenue Trend", self.subtitle_style)
            elements.append(trend_title)
            
            trend_data = [['Month', 'Revenue']]
            for month, amount in sorted(monthly_revenue.items()):
                trend_data.append([month, f"${amount:.2f}"])
            
            trend_table = Table(trend_data, colWidths=[2*inch, 2*inch])
            trend_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            elements.append(trend_table)
        
        doc.build(elements)
        return filepath

    def generate_equipment_report_xlsx(self, makerspace_id: str, start_date: date, end_date: date) -> str:
        """Generate equipment metrics Excel report"""
        from models.analytics import EquipmentUsageLog
        
        usage_logs = self.db.query(EquipmentUsageLog).filter(
            EquipmentUsageLog.makerspace_id == makerspace_id,
            EquipmentUsageLog.session_start >= start_date,
            EquipmentUsageLog.session_start <= end_date
        ).all()
        
        filename = f"equipment_report_{makerspace_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
        filepath = os.path.join("/tmp", filename)
        
        with pd.ExcelWriter(filepath, engine='openpyxl') as writer:
            # Summary by equipment
            equipment_summary = {}
            for log in usage_logs:
                eq_id = str(log.equipment_id)
                if eq_id not in equipment_summary:
                    equipment_summary[eq_id] = {
                        'total_sessions': 0,
                        'total_minutes': 0,
                        'total_power': 0,
                        'maintenance_required': 0,
                        'avg_success_rate': []
                    }
                
                equipment_summary[eq_id]['total_sessions'] += 1
                equipment_summary[eq_id]['total_minutes'] += log.duration_minutes or 0
                equipment_summary[eq_id]['total_power'] += log.power_consumption_kwh or 0
                if log.maintenance_required:
                    equipment_summary[eq_id]['maintenance_required'] += 1
                if log.success_rate is not None:
                    equipment_summary[eq_id]['avg_success_rate'].append(log.success_rate)
            
            summary_data = []
            for eq_id, data in equipment_summary.items():
                avg_success = sum(data['avg_success_rate']) / len(data['avg_success_rate']) if data['avg_success_rate'] else 0
                summary_data.append({
                    'Equipment ID': eq_id,
                    'Total Sessions': data['total_sessions'],
                    'Total Hours': round(data['total_minutes'] / 60, 2),
                    'Total Power (kWh)': round(data['total_power'], 2),
                    'Maintenance Alerts': data['maintenance_required'],
                    'Average Success Rate': f"{avg_success:.1f}%"
                })
            
            pd.DataFrame(summary_data).to_excel(writer, sheet_name='Equipment Summary', index=False)
            
            # Detailed usage logs
            detailed_data = []
            for log in usage_logs:
                detailed_data.append({
                    'Equipment ID': str(log.equipment_id),
                    'User ID': str(log.user_id),
                    'Session Start': log.session_start,
                    'Session End': log.session_end,
                    'Duration (minutes)': log.duration_minutes,
                    'Job ID': str(log.job_id) if log.job_id else 'N/A',
                    'Success Rate': f"{log.success_rate:.1f}%" if log.success_rate else 'N/A',
                    'Power Consumption (kWh)': log.power_consumption_kwh,
                    'Maintenance Required': log.maintenance_required,
                    'Notes': log.notes or ''
                })
            
            pd.DataFrame(detailed_data).to_excel(writer, sheet_name='Usage Logs', index=False)
        
        return filepath

    def generate_projects_report_csv(self, makerspace_id: str, start_date: date, end_date: date) -> str:
        """Generate project analytics CSV report"""
        from models.analytics import ProjectAnalytics
        
        projects = self.db.query(ProjectAnalytics).filter(
            ProjectAnalytics.makerspace_id == makerspace_id,
            ProjectAnalytics.created_at >= start_date,
            ProjectAnalytics.created_at <= end_date
        ).all()
        
        data = []
        for project in projects:
            data.append({
                'Project ID': str(project.project_id),
                'Created By': str(project.created_by),
                'Total Cost': project.total_cost or 0,
                'BOM Items Count': project.bom_items_count,
                'External Items Count': project.external_items_count,
                'Print Time (hours)': project.print_time_hours or 0,
                'Material Efficiency (%)': project.material_efficiency or 0,
                'Completion Rate (%)': project.completion_rate or 0,
                'Equipment Hours Used': project.equipment_hours_used or 0,
                'Collaboration Count': project.collaboration_count,
                'Complexity Score': project.complexity_score or 0,
                'Created At': project.created_at,
                'Updated At': project.updated_at
            })
        
        df = pd.DataFrame(data)
        
        filename = f"projects_report_{makerspace_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        filepath = os.path.join("/tmp", filename)
        
        # Add summary header
        with open(filepath, 'w') as f:
            f.write("# PROJECT ANALYTICS REPORT\n")
            f.write(f"# Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"# Period: {start_date} to {end_date}\n")
            f.write(f"# Total Projects: {len(df)}\n")
            if not df.empty:
                f.write(f"# Average Cost: ${df['Total Cost'].mean():.2f}\n")
                f.write(f"# Average BOM Size: {df['BOM Items Count'].mean():.1f}\n")
                f.write(f"# Average Completion: {df['Completion Rate (%)'].mean():.1f}%\n")
            f.write("\n")
        
        df.to_csv(filepath, mode='a', index=False)
        return filepath

    def cleanup_old_reports(self, days_old: int = 7):
        """Clean up old report files"""
        import glob
        import time
        
        cutoff_time = time.time() - (days_old * 24 * 60 * 60)
        report_files = glob.glob("/tmp/*_report_*.{csv,xlsx,pdf}")
        
        for file_path in report_files:
            if os.path.getctime(file_path) < cutoff_time:
                try:
                    os.remove(file_path)
                except OSError:
                    pass  # File already deleted or permission issue
