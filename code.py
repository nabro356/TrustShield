# ==========================================
# SLIDE 8: MULTI-SITE PARTS & BULK CODES (EXCLUDING 1-TO-1 MAPPINGS)
# ==========================================
def multi_site_audit(df, entity_col, dataset_label):
    sub = df[[entity_col, "Part Site"]].dropna().drop_duplicates()
    site_counts = sub.groupby(entity_col)["Part Site"].nunique()

    total_entities = int(len(site_counts))
    single_site_1to1 = int((site_counts == 1).sum())
    multi_site_gt1 = int((site_counts > 1).sum())
    max_sites = int(site_counts.max()) if total_entities > 0 else 0

    summary_row = {
        "Entity": entity_col,
        "Dataset": dataset_label,
        "Total_Distinct_Entities": total_entities,
        "Single_Site_1to1 (Excluded)": single_site_1to1,
        "Multi_Site_Count (>1 Site)": multi_site_gt1,
        "Multi_Site_Share_Pct": round(multi_site_gt1 / total_entities * 100, 2) if total_entities else 0.0,
        "Max_Sites_Per_Entity": max_sites,
    }

    # Distribution among multi-site entities only (2, 3, 4, 5+ sites)
    multi_only = site_counts[site_counts > 1]
    buckets = pd.cut(
        multi_only,
        bins=[1, 2, 3, 4, 1000],
        labels=["2 Sites", "3 Sites", "4 Sites", "5+ Sites"]
    )
    dist_df = (
        buckets.value_counts()
        .reindex(["2 Sites", "3 Sites", "4 Sites", "5+ Sites"], fill_value=0)
        .rename("Entity_Count")
        .reset_index()
        .rename(columns={"index": "Site_Span_Bucket"})
    )
    dist_df.insert(0, "Entity", entity_col)
    dist_df.insert(1, "Dataset", dataset_label)
    dist_df["Pct_Of_Multi_Site"] = (
        (dist_df["Entity_Count"] / multi_site_gt1 * 100).round(2) if multi_site_gt1 else 0.0
    )

    # Top multi-site entities with exact site list
    top_df = (
        sub.groupby(entity_col)["Part Site"]
        .agg(Distinct_Sites="nunique", Sites_List=lambda s: " | ".join(sorted(s)))
        .query("Distinct_Sites > 1")
        .sort_values(["Distinct_Sites", entity_col], ascending=[False, True])
        .reset_index()
    )

    return summary_row, dist_df, top_df

# Compute for Part Name & Bulk Value (Clean + Raw for cross-checking)
p_clean_sum, p_clean_dist, p_clean_top = multi_site_audit(df_clean, "Part Name", "Clean")
b_clean_sum, b_clean_dist, b_clean_top = multi_site_audit(df_clean, "Bulk Value", "Clean")
p_raw_sum, p_raw_dist, _ = multi_site_audit(df_raw, "Part Name", "Raw")
b_raw_sum, b_raw_dist, _ = multi_site_audit(df_raw, "Bulk Value", "Raw")

df_multisite_summary = pd.DataFrame([p_clean_sum, b_clean_sum, p_raw_sum, b_raw_sum])
df_multisite_dist = pd.concat([p_clean_dist, b_clean_dist], ignore_index=True)

print("--- 1. MULTI-SITE SUMMARY (EXCLUDING 1-TO-1 MAPPINGS) ---")
display(df_multisite_summary)

print("\n--- 2. MULTI-SITE BREAKDOWN BY NUMBER OF SITES (CLEAN DATA) ---")
display(df_multisite_dist)

print("\n--- 3. TOP 15 MULTI-SITE PARTS (CLEAN DATA) ---")
display(p_clean_top.head(15))

print("\n--- 4. TOP 15 MULTI-SITE BULK CODES (CLEAN DATA) ---")
display(b_clean_top.head(15))

# Ready-to-copy Slide 8 callout text
print("\n" + "=" * 65)
print("SLIDE 8 CALLOUT COPY-PASTE:")
print(f"• Parts in multiple sites : {p_clean_sum['Multi_Site_Count (>1 Site)']:,} of {p_clean_sum['Total_Distinct_Entities']:,} ({p_clean_sum['Multi_Site_Share_Pct']:.1f}%, max {p_clean_sum['Max_Sites_Per_Entity']} sites)")
print(f"• Bulks in multiple sites : {b_clean_sum['Multi_Site_Count (>1 Site)']:,} of {b_clean_sum['Total_Distinct_Entities']:,} ({b_clean_sum['Multi_Site_Share_Pct']:.1f}%, max {b_clean_sum['Max_Sites_Per_Entity']} sites)")
print("=" * 65)
