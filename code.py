# ==========================================
# 10. EXPORT ALL SECTION OUTPUTS TO PDF REPORT
# ==========================================
OUTPUT_PDF = "Data_Assessment_and_EDA_Report.pdf"
MAX_ROWS_PER_TABLE = 40      # Cap long tables (e.g., hotspots/bulk) so PDF stays concise
MAX_CELL_CHARS = 55          # Truncate very long pipe-joined text strings for clean wrapping

# Human-readable titles for every section table already generated in Cells 2-10
PDF_SECTIONS = [
    ("1.1 Data Type Mismatch Report", df_type_mismatch),
    ("1.2 Column Profile (Raw)", df_col_profile),
    ("1.3 Master Entity Summary", master_summary),
    ("1.5 & 1.6 Grain & Key Uniqueness", df_grain_uniqueness),
    ("1.7 Data Volume by Year (Raw)", df_vol_year),
    ("1.7 Data Volume by Year-Month (Raw)", df_vol_month),
    ("2.1 Column-Wise Missing Values & Severity", df_missing_col),
    ("2.2 Missing Record Counts by Year", df_miss_by_year_cnt.reset_index()),
    ("3.1 Master Data Mapping Consistency", df_mapping_summary),
    ("4.1 Coverage & Discontinuation Summary", df_coverage_summary),
    ("4.1b Discontinued Part Breakdown (Region / Site / Bulk / Segment)", df_discontinued),
    ("4.2 Reconciliation by Region", recon_tables["Region"]),
    ("4.2 Reconciliation by Business Segment", recon_tables["Segment"]),
    ("4.2 Reconciliation by Part Site (Top 40)", recon_tables["Site"]),
    ("4.2 Reconciliation by Bulk Value (Top 40)", recon_tables["Bulk"]),
    ("4.2 Reconciliation by Year", recon_tables["Year"]),
    ("4.2 Reconciliation by Quarter", recon_tables["Quarter"]),
    ("4.2 Cross Reconciliation: Region x Year (Quantity)", cross_reg_yr.reset_index()),
    ("4.3 Transaction-Level Outlier Overview", outlier_overview),
    ("4.3 Top Transaction Outlier Hotspots (Part-Site-Region-Segment)", outlier_hotspots),
    ("4.3 Top Transaction Outlier Hotspots (Part-Region)", outlier_hotspots_pr),
    ("5.1 Data Cleaning Waterfall", df_waterfall),
    ("5.2 Cleaning Filter Overlap (Raw)", df_overlap),
    ("6.1 Post-Cleaning EDA by Region Id", eda_region),
    ("6.2 Post-Cleaning EDA by Business Segment", eda_segment),
    ("6.3 Distinct Part Names: Segment x Region", ct_parts_reg_seg.reset_index()),
    ("6.4 Total Quantity: Segment x Region", ct_qty_reg_seg.reset_index()),
    ("6.5 Monthly Quantity Seasonality by Year", seasonality_qty.reset_index()),
    ("6.6 ABC / Pareto Volume Concentration", abc_summary),
    ("7.1 All 15 Year Combinations (Row Existence Basis)", report_all_15_iters),
    ("7.1b All 15 Year Combinations (Positive Demand > 0 Basis)", report_pos_iters),
    ("7.2 Collapsed 2023-2025 Iterations (Positive Demand Basis)", report_3yr_iters),
    ("7.3 Year Iteration (Demand > 0) Count by Region", ct_iter_region.reset_index()),
    ("7.4 Forecasting Eligibility Tiers", tier_summary),
    ("7.5 Demand Patterns (SBC Classification - Active Last Year)", sbc_summary),
    ("7.7 Launch Cohorts (Year & Half-Year)", launch_cohorts),
    ("7.7b Lifecycle Status Summary", lifecycle_summary),
    ("7.8 Monthly-Grain Outlier Summary", monthly_outlier_summary),
    ("7.8 Top Unexplained Monthly Outliers (Review Only)", monthly_outlier_rows),
]

# Executive KPI summary table for Page 1
active_series_cnt = int((series_catalog[f"Pos_{YEARS[-1]}"] == 1).sum())
kpi_summary_df = pd.DataFrame([
    {"Metric": "Source File", "Value": os.path.basename(FILE_PATH)},
    {"Metric": "Historical Date Window", "Value": f"{min_date:%Y-%m-%d} to {max_date:%Y-%m-%d} ({TOTAL_CAL_MONTHS} months)"},
    {"Metric": "Raw Rows -> Clean Rows", "Value": f"{len(df_raw):,} -> {len(df_clean):,} ({(1 - len(df_clean)/len(df_raw))*100:.2f}% removed)"},
    {"Metric": "Raw Quantity -> Clean Quantity", "Value": f"{df_raw['Quantity'].sum():,.2f} -> {df_clean['Quantity'].sum():,.2f}"},
    {"Metric": "Distinct Part Names (Clean)", "Value": f"{df_clean['Part Name'].nunique():,}"},
    {"Metric": "Total (Part Name + Region Id) Series", "Value": f"{len(series_catalog):,}"},
    {"Metric": f"Forecastable Series (Active in {YEARS[-1]})", "Value": f"{active_series_cnt:,} ({active_series_cnt/len(series_catalog)*100:.1f}%)"},
    {"Metric": f"Dormant / Zero-Only Series (No {YEARS[-1]} Demand)", "Value": f"{len(series_catalog) - active_series_cnt:,} ({(1 - active_series_cnt/len(series_catalog))*100:.1f}%)"},
])

def format_df_for_pdf(df, max_rows=MAX_ROWS_PER_TABLE):
    out = excel_safe(df).copy()
    total_rows = len(out)
    truncated = total_rows > max_rows
    if truncated:
        out = out.head(max_rows).copy()

    for col in out.columns:
        if pd.api.types.is_float_dtype(out[col]):
            out[col] = out[col].map(lambda v: "" if pd.isna(v) else (f"{int(v):,}" if v == int(v) and abs(v) >= 1000 else f"{v:,.2f}"))
        elif pd.api.types.is_integer_dtype(out[col]):
            out[col] = out[col].map(lambda v: "" if pd.isna(v) else f"{int(v):,}")
        else:
            out[col] = out[col].fillna("").astype(str).map(
                lambda s: s if len(s) <= MAX_CELL_CHARS else s[:MAX_CELL_CHARS - 3] + "..."
            )
    out.columns = [str(c).replace("_", " ") for c in out.columns]
    return out, total_rows, truncated

def build_pdf_reportlab(pdf_path):
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import landscape, letter
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak, Image

    page_w, page_h = landscape(letter)
    margin = 0.4 * inch
    usable_w = page_w - 2 * margin

    doc = SimpleDocTemplate(
        pdf_path, pagesize=landscape(letter),
        leftMargin=margin, rightMargin=margin, topMargin=margin, bottomMargin=margin
    )
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("RptTitle", parent=styles["Heading1"], fontSize=16, textColor=colors.HexColor("#1B365D"), spaceAfter=4)
    sub_style = ParagraphStyle("RptSub", parent=styles["Normal"], fontSize=9, textColor=colors.HexColor("#555555"), spaceAfter=10)
    sec_style = ParagraphStyle("SecHdr", parent=styles["Heading2"], fontSize=11, textColor=colors.HexColor("#1B365D"), spaceBefore=10, spaceAfter=4, keepWithNext=True)
    note_style = ParagraphStyle("NoteTxt", parent=styles["Italic"], fontSize=7.5, textColor=colors.HexColor("#666666"), spaceBefore=2, spaceAfter=8)
    cell_style = ParagraphStyle("CellTxt", parent=styles["Normal"], fontSize=6.8, leading=8.2)
    hdr_style = ParagraphStyle("HdrTxt", parent=styles["Normal"], fontSize=7.0, leading=8.4, textColor=colors.white)

    def make_rl_table(df_fmt, max_w):
        ncols = len(df_fmt.columns)
        # Estimate proportional column widths from header + sample cell lengths
        col_lens = []
        for c in df_fmt.columns:
            max_len = max([len(str(c))] + [len(str(v)) for v in df_fmt[c].head(30)])
            col_lens.append(max(min(max_len, 32), 6))
        total_len = sum(col_lens)
        col_widths = [max_w * (l / total_len) for l in col_lens]

        header_row = [Paragraph(f"<b>{c}</b>", hdr_style) for c in df_fmt.columns]
        body_rows = [[Paragraph(str(val), cell_style) for val in row] for row in df_fmt.itertuples(index=False)]
        tbl = Table([header_row] + body_rows, colWidths=col_widths, repeatRows=1)
        tbl.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1B365D")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F4F7FA")]),
            ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#CCCCCC")),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ("LEFTPADDING", (0, 0), (-1, -1), 4),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ]))
        return tbl

    story = [
        Paragraph("Data Assessment, Cleaning & Forecast-Readiness Report", title_style),
        Paragraph(f"Granularity: Part Name + Region Id | Window: {full_ym_index[0]} to {full_ym_index[-1]} ({TOTAL_CAL_MONTHS} months)", sub_style),
        Paragraph("Executive KPI Summary", sec_style),
        make_rl_table(kpi_summary_df, usable_w * 0.75),
        Spacer(1, 10),
    ]

    if os.path.exists(OUTPUT_DASHBOARD_PNG):
        story.append(Paragraph("Visual EDA & Year-Iteration Readiness Dashboard", sec_style))
        story.append(Image(OUTPUT_DASHBOARD_PNG, width=usable_w * 0.88, height=usable_w * 0.88 * (12 / 18)))

    story.append(PageBreak())

    for sec_title, raw_tbl in PDF_SECTIONS:
        if raw_tbl is None or len(raw_tbl) == 0:
            continue
        fmt_tbl, tot_r, trunc = format_df_for_pdf(raw_tbl)
        story.append(Paragraph(sec_title, sec_style))
        story.append(make_rl_table(fmt_tbl, usable_w))
        if trunc:
            story.append(Paragraph(f"Showing top {MAX_ROWS_PER_TABLE} of {tot_r:,} rows. Full table available in '{OUTPUT_EXCEL}'.", note_style))
        else:
            story.append(Spacer(1, 8))

    doc.build(story)

def build_pdf_matplotlib(pdf_path):
    from matplotlib.backends.backend_pdf import PdfPages

    with PdfPages(pdf_path) as pdf:
        # Page 1: KPI Table
        fig, ax = plt.subplots(figsize=(11, 8.5))
        ax.axis("off")
        ax.set_title("Data Assessment, Cleaning & Forecast-Readiness Report\nExecutive KPI Summary", fontsize=14, fontweight="bold", pad=16)
        t = ax.table(cellText=kpi_summary_df.values, colLabels=kpi_summary_df.columns, loc="center", cellLoc="left")
        t.auto_set_font_size(False)
        t.set_fontsize(9)
        t.scale(1, 1.6)
        pdf.savefig(fig, bbox_inches="tight")
        plt.close(fig)

        # Page 2: Dashboard image
        if os.path.exists(OUTPUT_DASHBOARD_PNG):
            fig, ax = plt.subplots(figsize=(11, 8.5))
            ax.axis("off")
            ax.imshow(plt.imread(OUTPUT_DASHBOARD_PNG))
            pdf.savefig(fig, bbox_inches="tight")
            plt.close(fig)

        # Subsequent pages: One table per page
        for sec_title, raw_tbl in PDF_SECTIONS:
            if raw_tbl is None or len(raw_tbl) == 0:
                continue
            fmt_tbl, tot_r, trunc = format_df_for_pdf(raw_tbl, max_rows=32)
            fig, ax = plt.subplots(figsize=(11, 8.5))
            ax.axis("off")
            subtitle = f" (Top 32 of {tot_r:,} rows)" if trunc else ""
            ax.set_title(sec_title + subtitle, fontsize=11, fontweight="bold", pad=12)
            t = ax.table(cellText=fmt_tbl.values, colLabels=fmt_tbl.columns, loc="center", cellLoc="left")
            t.auto_set_font_size(False)
            t.set_fontsize(max(5.5, min(8.0, 68.0 / max(len(fmt_tbl.columns), 1))))
            t.scale(1, 1.25)
            pdf.savefig(fig, bbox_inches="tight")
            plt.close(fig)

try:
    build_pdf_reportlab(OUTPUT_PDF)
    print(f"Exported formatted PDF report (ReportLab) -> '{OUTPUT_PDF}'")
except ImportError:
    build_pdf_matplotlib(OUTPUT_PDF)
    print(f"Exported PDF report (Matplotlib fallback) -> '{OUTPUT_PDF}'")
