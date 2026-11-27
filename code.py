# ==========================================
# EXACT ANSWERS FOR SLIDE 7 & SLIDE 8 CALLOUT CARDS
# ==========================================
print("=" * 65)
print("SLIDE 7: DATA GRAIN & TRANSACTION STRUCTURE (CALLOUT CARDS)")
print("=" * 65)

# 1. Orders per day (Overall dataset & Entity-level)
daily_raw = df_raw.groupby("Date").size()
daily_clean = df_clean.groupby("Date").size()

cal_days_raw = (df_raw["Date"].max() - df_raw["Date"].min()).days + 1
cal_days_clean = (df_clean["Date"].max() - df_clean["Date"].min()).days + 1

max_pr_day = df_clean.groupby(["Part Name", "Region Id", "Date"]).size().max()
max_br_day = df_clean.groupby(["Bulk Value", "Region Id", "Date"]).size().max()

print(f"\n[Card 2: Maximum Orders per Day]")
print(f"  Raw Dataset Max on a Single Date   : {daily_raw.max():,} rows (on {daily_raw.idxmax():%Y-%m-%d})")
print(f"  Clean Dataset Max on a Single Date : {daily_clean.max():,} rows (on {daily_clean.idxmax():%Y-%m-%d})")
print(f"  Max Same-Day Orders (Part+Region)  : {max_pr_day:,}")
print(f"  Max Same-Day Orders (Bulk+Region)  : {max_br_day:,}")

print(f"\n[Card 3: Avg. Orders per Day]")
print(f"  Raw Avg per Active Order Day       : {daily_raw.mean():,.1f} rows/day (across {len(daily_raw):,} active days)")
print(f"  Clean Avg per Active Order Day     : {daily_clean.mean():,.1f} rows/day (across {len(daily_clean):,} active days)")
print(f"  Clean Avg per Calendar Day         : {len(df_clean) / cal_days_clean:,.1f} rows/day (across {cal_days_clean:,} calendar days)")

# 2. Monthly grain consolidation points
br_ym_raw = len(df_raw.dropna(subset=["Bulk Value", "Region Id", "YearMonth"]).drop_duplicates(["Bulk Value", "Region Id", "YearMonth"]))
br_ym_clean = len(df_clean.drop_duplicates(["Bulk Value", "Region Id", "YearMonth"]))

pr_ym_raw = len(df_raw.dropna(subset=["Part Name", "Region Id", "YearMonth"]).drop_duplicates(["Part Name", "Region Id", "YearMonth"]))
pr_ym_clean = len(df_clean.drop_duplicates(["Part Name", "Region Id", "YearMonth"]))

print(f"\n[Card 4: Monthly Grain Consolidates]")
print(f"  Bulk x Region x Month (Clean)      : {br_ym_clean:,} points  (Raw: {br_ym_raw:,})")
print(f"  Part x Region x Month (Clean)      : {pr_ym_clean:,} points  (Raw: {pr_ym_raw:,})")

print("\n" + "=" * 65)
print("SLIDE 8: MASTER DATA INTEGRITY & HIERARCHY MAPPING (CALLOUT CARDS)")
print("=" * 65)

def card_stats(df, src, tgt):
    sub = df[[src, tgt]].dropna().drop_duplicates()
    cnts = sub.groupby(src)[tgt].nunique()
    return int((cnts > 1).sum()), int(cnts.max()) if len(cnts) else 0

b_site_n, b_site_max = card_stats(df_clean, "Bulk Value", "Part Site")
b_reg_n, b_reg_max = card_stats(df_clean, "Bulk Value", "Region Id")
b_seg_n, b_seg_max = card_stats(df_clean, "Bulk Value", "Business Segment Description")
p_site_n, p_site_max = card_stats(df_clean, "Part Name", "Part Site")
p_seg_n, p_seg_max = card_stats(df_clean, "Part Name", "Business Segment Description")

print(f"\n[Card 1: Parts span sites & regions]")
print(f"  Parts in multiple sites            : {p_site_n:,} (max {p_site_max} sites)")

print(f"\n[Card 2: Bulk span sites & regions]")
print(f"  Bulk in multiple sites             : {b_site_n:,} (max {b_site_max} sites)")
print(f"  Bulk in multiple regions           : {b_reg_n:,} (max {b_reg_max} regions)")

print(f"\n[Card 3: Multi-segment parts]")
print(f"  Parts in multiple segments         : {p_seg_n:,} (max {p_seg_max} segments)")

print(f"\n[Card 4: Multi-segment Bulk]")
print(f"  Bulk in multiple segments          : {b_seg_n:,} (max {b_seg_max} segments)")

# Verify bottom 3 clean 1:1 boxes on Slide 8
p_desc_n, _ = card_stats(df_clean, "Part Name", "Part Description")
s_desc_n, _ = card_stats(df_clean, "Business Segment Value", "Business Segment Description")
site_reg_n, _ = card_stats(df_clean, "Part Site", "Region Id")
print(f"\n[Bottom 3 Verification Boxes (Clean Data)]")
print(f"  Part -> Description conflicts      : {p_desc_n}")
print(f"  Segment Code -> Desc conflicts     : {s_desc_n}")
print(f"  Site -> Region conflicts           : {site_reg_n}")
