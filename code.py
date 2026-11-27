# ==========================================
# SLIDE 6 (EXTRA): MONTHLY DEMAND TRENDS BY BUSINESS SEGMENT & BY REGION
# ==========================================
all_ym = pd.period_range(df_clean["YearMonth"].min(), df_clean["YearMonth"].max(), freq="M")
ym_labels = [str(p) for p in all_ym]
x_idx = np.arange(len(all_ym))

# 1. Business Segment Monthly Pivot (ordered by total volume descending)
seg_order = (
    df_clean.groupby("Business Segment Description")["Quantity"]
    .sum()
    .sort_values(ascending=False)
    .index.tolist()
)
seg_monthly = (
    df_clean.pivot_table(
        index="YearMonth", columns="Business Segment Description",
        values="Quantity", aggfunc="sum", fill_value=0
    )
    .reindex(index=all_ym, columns=seg_order, fill_value=0)
)

# 2. Region Id Monthly Pivot (ordered by total volume descending)
reg_order = (
    df_clean.groupby("Region Id")["Quantity"]
    .sum()
    .sort_values(ascending=False)
    .index.tolist()
)
reg_monthly = (
    df_clean.pivot_table(
        index="YearMonth", columns="Region Id",
        values="Quantity", aggfunc="sum", fill_value=0
    )
    .reindex(index=all_ym, columns=reg_order, fill_value=0)
)

markers = ["o", "s", "^", "D", "v", "P", "X", "*"]

# --- PLOT 1: ALL BUSINESS SEGMENTS ON ONE LINE GRAPH ---
fig, ax = plt.subplots(figsize=(13.5, 5.6))
seg_colors = sns.color_palette("tab10", len(seg_order))

for i, seg in enumerate(seg_order):
    ax.plot(
        x_idx, seg_monthly[seg].values,
        label=seg, color=seg_colors[i],
        marker=markers[i % len(markers)], markersize=4.5, linewidth=2.0
    )

ax.set_xticks(x_idx)
ax.set_xticklabels(ym_labels, rotation=65, ha="right", fontsize=8.5)
ax.yaxis.set_major_formatter(mtick.StrMethodFormatter("{x:,.0f}"))
ax.set_ylim(0, seg_monthly.values.max() * 1.15)
ax.set_title("Monthly Demand Trend by Business Segment (Oct 2022 – Dec 2025)", fontsize=13, fontweight="bold", color=NAVY, pad=12)
ax.set_ylabel("Total Quantity", fontsize=10)
ax.legend(title="Business Segment", bbox_to_anchor=(1.01, 1), loc="upper left", frameon=False, fontsize=9, title_fontsize=9.5)
ax.grid(axis="y", linestyle="--", alpha=0.4)
ax.grid(axis="x", visible=False)
sns.despine(top=True, right=True)

plt.tight_layout()
s6_seg_png = os.path.join(OUT_DIR, "Slide6_Monthly_Demand_By_Segment.png")
plt.savefig(s6_seg_png, dpi=300, bbox_inches="tight")
plt.show()

# --- PLOT 2: ALL REGIONS ON ONE LINE GRAPH ---
fig, ax = plt.subplots(figsize=(13.5, 5.4))
reg_colors = [NAVY, TEAL, ORANGE, BLUE, AMBER] + list(sns.color_palette("Set2", max(0, len(reg_order) - 5)))

for i, reg in enumerate(reg_order):
    ax.plot(
        x_idx, reg_monthly[reg].values,
        label=reg, color=reg_colors[i],
        marker=markers[i % len(markers)], markersize=5.0, linewidth=2.2
    )

ax.set_xticks(x_idx)
ax.set_xticklabels(ym_labels, rotation=65, ha="right", fontsize=8.5)
ax.yaxis.set_major_formatter(mtick.StrMethodFormatter("{x:,.0f}"))
ax.set_ylim(0, reg_monthly.values.max() * 1.15)
ax.set_title("Monthly Demand Trend by Region Id (Oct 2022 – Dec 2025)", fontsize=13, fontweight="bold", color=NAVY, pad=12)
ax.set_ylabel("Total Quantity", fontsize=10)
ax.legend(title="Region Id", ncol=len(reg_order), loc="upper left", frameon=True, fontsize=9, title_fontsize=9.5)
ax.grid(axis="y", linestyle="--", alpha=0.4)
ax.grid(axis="x", visible=False)
sns.despine(top=True, right=True)

plt.tight_layout()
s6_reg_png = os.path.join(OUT_DIR, "Slide6_Monthly_Demand_By_Region.png")
plt.savefig(s6_reg_png, dpi=300, bbox_inches="tight")
plt.show()

print(f"Saved charts -> '{s6_seg_png}' & '{s6_reg_png}'")
