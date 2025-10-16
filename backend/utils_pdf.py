from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import cm

LABELS = {0: "Bacterial leaf blight", 1: "Brown spot", 2: "Leaf smut"}

def build_report_pdf(buf, start, end, items):
    c = canvas.Canvas(buf, pagesize=A4)
    w, h = A4
    c.setTitle("Rice Disease Report")

    # Tiêu đề
    c.setFont("Helvetica-Bold", 16)
    c.drawString(2*cm, h-2*cm, "Rice Disease Statistics Report")

    # Chỉ in Period khi có ít nhất start/end
    if (start or end):
        c.setFont("Helvetica", 11)
        period = f"Period: {start or '...'} -> {end or '...'}"
        c.drawString(2*cm, h-3*cm, period)
        y = h - 4*cm
    else:
        y = h - 3*cm  # kéo nội dung lên nếu không có Period

    # Header bảng
    c.setFont("Helvetica-Bold", 12)
    c.drawString(2*cm, y, "Label")
    c.drawString(9*cm, y, "Count")
    y -= 0.8*cm

    # Dòng dữ liệu
    c.setFont("Helvetica", 11)
    total = 0
    for row in items:
        c.drawString(2*cm, y, f"{row['label']} - {LABELS.get(row['label'], str(row['label']))}")
        c.drawString(9*cm, y, str(row["count"]))
        total += row["count"]
        y -= 0.7*cm

    # Tổng
    c.setFont("Helvetica-Bold", 12)
    c.drawString(2*cm, y-0.3*cm, f"Total: {total}")

    c.showPage()
    c.save()
