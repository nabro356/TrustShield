# ==========================================
# ANUJ'S UPDATES: SLIDE 5 RIGHT-HAND BOXES & UPDATED SLIDE 7 CHART
# ==========================================

# 1. Card 1: Total records at Month x Part x Region and Month x Bulk x Region
m_pr_raw = df_raw.dropna(subset=["YearMonth", "Part Name", "Region Id"]).drop_duplicates(["YearMonth", "Part Name", "Region Id"])
m_br_raw = df_raw.dropna(subset=["YearMonth", "Bulk Value", "Region Id"]).drop_duplicates(["YearMonth", "Bulk Value", "Region Id"])

m_pr_clean = df_clean.drop_duplicates(["YearMonth", "Part Name", "Region Id"])
m_br_clean = df_clean.drop_duplicates(["YearMonth", "Bulk Value", "Region Id"])

# Also check how many monthly tuples have missing Business Segment (in case Card 1 keeps "Segment Gap" title)
m_pr_seg_gap = len(df_raw[df_raw["Business Segment Description"].isna()].dropna(subset=["YearMonth", "Part Name", "Region Id"]).drop_duplicates(["YearMonth", "Part Name", "Region Id"]))
m_br_seg_gap = len(df_raw[df_raw["Business Segment Description"].isna()].dropna(subset=["YearMonth", "Bulk Value", "Region Id"]).drop_duplicates(["YearMonth", "Bulk Value", "Region Id"]))

print("=== CARD 1: MONTHLY CONSOLIDATED RECORD COUNTS ===")
print(f"Month × Part × Region : {len(m_pr_raw):,} records (Raw) | {len(m_pr_clean):,} records (Clean)")
print(f"Month × Bulk × Region : {len(m_br_raw):,} records (Raw) | {len(m_br_clean):,} records (Clean)")
print(f"Monthly tuples with missing Segment: {m_pr_seg_gap:,} (Month×Part×Region) | {m_br_seg_gap:,} (Month×Bulk×Region)")

# 2. Card 2: % of Bulk x Region series active in 2025 (Quantity > 0)
br_all_raw = df_raw.dropna(subset=["Bulk Value", "Region Id"]).groupby(["Bulk Value", "Region Id"])["Quantity"].sum()
br_25_raw = df_raw[df_raw["Year"] == 2025].dropna(subset=["Bulk Value", "Region Id"]).groupby(["Bulk Value", "Region Id"])["Quantity"].sum()
act_br_raw = int((br_25_raw > 0).sum())

br_all_clean = df_clean.groupby(["Bulk Value", "Region Id"])["Quantity"].sum()
br_25_clean = df_clean[df_clean["Year"] == 2025].groupby(["Bulk Value", "Region Id"])["Quantity"].sum()
act_br_clean = int((br_25_clean > 0).sum())

print("\n=== CARD 2: BULK × REGION ACTIVE IN 2025 ===")
print(f"Raw   : Only ~{act_br_raw / len(br_all_raw) * 100:.1f}% ({act_br_raw:,} of {len(br_all_raw):,}) of Bulk × Region series active in 2025")
print(f"Clean : Only ~{act_br_clean / len(br_all_clean) * 100:.1f}% ({act_br_clean:,} of {len(br_all_clean):,}) of Bulk × Region series active in 2025")

# 3. Card 3: How many records are 0 demand at Bulk Region level
# (a) Aggregated at Bulk x Region x Month level (Clean & Raw)
brm_clean_agg = df_clean.groupby(["Bulk Value", "Region Id", "YearMonth"], as_index=False)["Quantity"].sum()
zero_brm_clean = int((brm_clean_agg["Quantity"] == 0).sum())

brm_raw_agg = df_raw.dropna(subset=["Bulk Value", "Region Id", "YearMonth"]).groupby(["Bulk Value", "Region Id", "YearMonth"], as_index=False)["Quantity"].sum()
zero_brm_raw = int((brm_raw_agg["Quantity"] == 0).sum())

# (b) Within 2025-active Bulk x Region series (monthly level & transaction level)
active_br_idx = br_25_clean[br_25_clean > 0].index
brm_active25 = brm_clean_agg.set_index(["Bulk Value", "Region Id"]).loc[lambda d: d.index.isin(active_br_idx)]
zero_brm_act25 = int((brm_active25["Quantity"] == 0).sum())

tx_active25 = df_clean.set_index(["Bulk Value", "Region Id"]).loc[lambda d: d.index.isin(active_br_idx)]
zero_tx_act25 = int((tx_active25["Quantity"] == 0).sum())

# (c) Bulk x Region pairs with 0 total demand across the entire 39 months
zero_br_series_clean = int((br_all_clean == 0).sum())

print("\n=== CARD 3: ZERO-DEMAND RECORDS AT BULK × REGION LEVEL ===")
print(f"Bulk × Region × Month zero-demand records (Clean)         : {zero_brm_clean:,} of {len(brm_clean_agg):,} ({zero_brm_clean / len(brm_clean_agg) * 100:.1f}%)")
print(f"Bulk × Region × Month zero-demand records (Raw)           : {zero_brm_raw:,} of {len(brm_raw_agg):,} ({zero_brm_raw / len(brm_raw_agg) * 100:.1f}%)")
print(f"Bulk × Region × Month zero-demand in 2025-active series   : {zero_brm_act25:,} of {len(brm_active25):,} ({zero_brm_act25 / len(brm_active25) * 100:.1f}%)")
print(f"Raw/Clean transaction rows with 0 demand in 2025-active BR: {zero_tx_act25:,} of {len(tx_active25):,} ({zero_tx_act25 / len(tx_active25) * 100:.1f}%)")
print(f"Bulk × Region series with 0 lifetime demand (all 39 mos)  : {zero_br_series_clean:,} of {len(br_all_clean):,}")

# 4. Updated Slide 7 Chart (No Forecast Grain / WMAPE Eval Grain labels; Title = "Data Granularity Structure")
grain_specs_clean = [
    ("1. Part Level", ["Part Name"]),
    ("2. Part Site Level", ["Part Site"]),
    ("3. Part × Region", ["Part Name", "Region Id"]),
    ("4. Bulk × Region", ["Bulk Value", "Region Id"]),
    ("5. Part × Region × Segment", ["Part Name", "Region Id", "Business Segment Description"]),
    ("6. Bulk × Region × Segment", ["Bulk Value", "Region Id", "Business Segment Description"]),
    ("7. Part × Site × Region × Segment", ["Part Name", "Part Site", "Region Id", "Business Segment Description"]),
]

s7_updated_rows = []
for label, cols in grain_specs_clean:
    sub_c = df_clean.dropna(subset=cols)
    uniq_c = len(sub_c.drop_duplicates(subset=cols))
    s7_updated_rows.append({
        "Aggregation Level": label,
        "Unique Entities (Clean)": uniq_c,
        "Avg Clean Rows per Entity": round(len(sub_c) / uniq_c, 1) if uniq_c else 0,
    })

df_s7_updated = pd.DataFrame(s7_updated_rows)
plot_s7_upd = df_s7_updated.iloc[::-1].reset_index(drop=True)

fig, ax = plt.subplots(figsize=(11, 5.2))
bar_cols_upd = [SLATE, SLATE, BLUE, TEAL, NAVY, SLATE, SLATE][::-1]
bars = ax.barh(plot_s7_upd["Aggregation Level"], plot_s7_upd["Unique Entities (Clean)"], color=bar_cols_upd, height=0.58)

ax.set_title("Data Granularity Structure", fontsize=13, fontweight="bold", color=NAVY, pad=12)
ax.set_xlabel("Distinct Combinations (Post-Cleaning)", fontsize=10)
ax.set_xlim(0, plot_s7_upd["Unique Entities (Clean)"].max() * 1.25)
ax.xaxis.set_major_formatter(mtick.StrMethodFormatter("{x:,.0f}"))
ax.grid(axis="x", linestyle="--", alpha=0.4)
ax.grid(axis="y", visible=False)
sns.despine(top=True, right=True)

for bar, (_, r) in zip(bars, plot_s7_upd.iterrows()):
    w = bar.get_width()
    ax.text(
        w, bar.get_y() + bar.get_height() / 2,
        f" {int(r['Unique Entities (Clean)']):,}  (avg {r['Avg Clean Rows per Entity']:.1f} rows/entity)",
        va="center", ha="left", fontsize=9, fontweight="bold", color="#222222"
    )

plt.tight_layout()
s7_png_updated = os.path.join(OUT_DIR, "Slide7_Data_Grain_Levels.png")
plt.savefig(s7_png_updated, dpi=300)
plt.show()
print(f"\nUpdated chart saved -> '{s7_png_updated}'")
