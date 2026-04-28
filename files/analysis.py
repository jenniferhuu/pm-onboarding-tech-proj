"""
Inventory Data Science Layer (Module 4)
======================================================
Run with:  python analysis.py
Requires:  pip install pandas matplotlib requests
"""

import json
import datetime
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

LOW_STOCK_THRESHOLD = 3
CONF_THRESHOLD      = 0.90

raw_inventory = [
    {"id": 1,  "name": "Arduino Kit",    "category": "Hardware",   "quantity": 5,  "status": "Available"},
    {"id": 2,  "name": "Figma License",  "category": "Software",   "quantity": 20, "status": "Available"},
    {"id": 3,  "name": "USB Cable",      "category": "Hardware",   "quantity": 12, "status": "Available"},
    {"id": 4,  "name": "Raspberry Pi",   "category": "Hardware",   "quantity": 2,  "status": "Available"},
    {"id": 5,  "name": "Soldering Iron", "category": "Equipment",  "quantity": 3,  "status": "Available"},
    {"id": 6,  "name": "GitHub Pro",     "category": "Software",   "quantity": 8,  "status": "Available"},
    {"id": 7,  "name": "Breadboard",     "category": "Hardware",   "quantity": 15, "status": "Available"},
    {"id": 8,  "name": "Multimeter",     "category": "Equipment",  "quantity": 1,  "status": "Unavailable"},
    {"id": 9,  "name": "Solder Wire",    "category": "Consumable", "quantity": 2,  "status": "Available"},
    {"id": 10, "name": "Notion License", "category": "Software",   "quantity": 0,  "status": "Unavailable"},
]

ml_predictions = [
    {"scene_id": "shelf_item_01", "predictions": [
        {"name": "Arduino Kit",  "confidence": 0.95},
        {"name": "USB Cable",    "confidence": 0.72},
    ]},
    {"scene_id": "shelf_item_02", "predictions": [
        {"name": "Raspberry Pi", "confidence": 0.88},
        {"name": "Breadboard",   "confidence": 0.45},
    ]},
    {"scene_id": "shelf_item_03", "predictions": [
        {"name": "Notion License", "confidence": 0.93},
        {"name": "GitHub Pro",     "confidence": 0.61},
    ]},
]

df = pd.DataFrame(raw_inventory)

print("=" * 60)
print("INVENTORY SUMMARY")
print("=" * 60)

total_items = len(df)
print(f"\nTotal items:    {total_items}")
print(f"Total quantity: {df['quantity'].sum()}")

print("\n── Items by category ──────────────────────────────────────")
by_category = df.groupby("category").agg(
    item_count=("name",     "count"),
    total_qty=("quantity",  "sum"),
    avg_qty=("quantity",    "mean"),
).reset_index()
by_category["avg_qty"] = by_category["avg_qty"].round(1)
print(by_category.to_string(index=False))

low_stock_df = df[(df["quantity"] > 0) & (df["quantity"] <= LOW_STOCK_THRESHOLD)]
out_of_stock_df = df[df["quantity"] == 0]
print(f"\n── Stock alerts ───────────────────────────────────────────")
print(f"Low stock  (qty ≤ {LOW_STOCK_THRESHOLD}): {len(low_stock_df)} item(s)")
for _, row in low_stock_df.iterrows():
    print(f"  • {row['name']} ({row['category']}) — qty: {row['quantity']}")
print(f"Out of stock (qty = 0): {len(out_of_stock_df)} item(s)")
for _, row in out_of_stock_df.iterrows():
    print(f"  • {row['name']} ({row['category']})")


print("\n" + "=" * 60)
print("ML PREDICTION FILTERING  (threshold = {})".format(CONF_THRESHOLD))
print("=" * 60)

accepted_predictions  = []
uncertain_predictions = []
audit_events          = []

for scene in ml_predictions:
    scene_id = scene["scene_id"]
    for pred in scene["predictions"]:
        entry = {**pred, "scene_id": scene_id}
        if pred["confidence"] >= CONF_THRESHOLD:
            accepted_predictions.append(entry)
        else:
            uncertain_predictions.append(entry)
            audit_events.append({
                "timestamp":          datetime.datetime.now().isoformat(),
                "scene_id":           scene_id,
                "item":               pred["name"],
                "event_type":         "UNCERTAIN",
                "confidence":         pred["confidence"],
                "recommended_action": "manual_review",
            })

print(f"\nAccepted  (≥ {CONF_THRESHOLD}): {len(accepted_predictions)}")
for p in accepted_predictions:
    print(f"  ✓ [{p['scene_id']}] {p['name']} — conf: {p['confidence']:.2f}")

print(f"\nUncertain (< {CONF_THRESHOLD}): {len(uncertain_predictions)}")
for p in uncertain_predictions:
    print(f"  ? [{p['scene_id']}] {p['name']} — conf: {p['confidence']:.2f}")


print("\n" + "=" * 60)
print("RECONCILIATION")
print("=" * 60)

inventory_lookup = {row["name"]: row for _, row in df.iterrows()}

for pred in accepted_predictions:
    item_name = pred["name"]
    inv_item  = inventory_lookup.get(item_name)

    if inv_item is None:
        event_type = "DISCREPANCY"
        action     = "investigate_unknown_item"
    elif inv_item["quantity"] == 0:
        event_type = "DISCREPANCY"
        action     = "update_inventory_recount"
    else:
        event_type = "VERIFIED"
        action     = "no_action_required"

    event = {
        "timestamp":          datetime.datetime.now().isoformat(),
        "scene_id":           pred["scene_id"],
        "item":               item_name,
        "event_type":         event_type,
        "confidence":         pred["confidence"],
        "recommended_action": action,
    }
    audit_events.append(event)
    symbol = "✓" if event_type == "VERIFIED" else "✗"
    print(f"  {symbol} {item_name:<20} → {event_type}  ({action})")

# Write audit log
audit_log_path = "audit_log.jsonl"
with open(audit_log_path, "w") as f:
    for event in audit_events:
        f.write(json.dumps(event) + "\n")
print(f"\nAudit log written → {audit_log_path}  ({len(audit_events)} events)")


COLORS = {
    "Hardware":   "#3b82f6",
    "Software":   "#8b5cf6",
    "Equipment":  "#10b981",
    "Consumable": "#ec4899",
}

fig, axes = plt.subplots(1, 3, figsize=(16, 5))
fig.suptitle("Open Project — Inventory Analytics", fontsize=14, fontweight="bold", y=1.02)

ax1 = axes[0]
cats   = by_category["category"].tolist()
counts = by_category["item_count"].tolist()
colors = [COLORS.get(c, "#888") for c in cats]
bars   = ax1.bar(cats, counts, color=colors, width=0.55, edgecolor="none")
ax1.set_title("Items per category", fontsize=12)
ax1.set_ylabel("Count")
ax1.set_ylim(0, max(counts) + 1)
for bar, val in zip(bars, counts):
    ax1.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.05, str(val),
             ha="center", va="bottom", fontsize=10)
ax1.spines[["top", "right"]].set_visible(False)

ax2 = axes[1]
qtys = by_category["total_qty"].tolist()
y_pos = range(len(cats))
hbars = ax2.barh(list(y_pos), qtys, color=colors, edgecolor="none")
ax2.set_yticks(list(y_pos))
ax2.set_yticklabels(cats)
ax2.set_title("Total quantity by category", fontsize=12)
ax2.set_xlabel("Units")
for bar, val in zip(hbars, qtys):
    ax2.text(bar.get_width() + 0.2, bar.get_y() + bar.get_height() / 2,
             str(val), va="center", fontsize=10)
ax2.spines[["top", "right"]].set_visible(False)

ax3 = axes[2]
normal    = len(df[(df["quantity"] > LOW_STOCK_THRESHOLD)])
low       = len(low_stock_df)
out       = len(out_of_stock_df)
sizes     = [normal, low, out]
labels    = ["Normal", "Low stock", "Out of stock"]
pie_colors = ["#22c55e", "#eab308", "#ef4444"]
wedges, texts, autotexts = ax3.pie(
    sizes, labels=labels, colors=pie_colors,
    autopct="%1.0f%%", startangle=90,
    wedgeprops={"width": 0.55, "edgecolor": "white"},
    textprops={"fontsize": 10},
)
ax3.set_title("Stock status breakdown", fontsize=12)

plt.tight_layout()
chart_path = "inventory_analysis.png"
plt.savefig(chart_path, dpi=150, bbox_inches="tight")
plt.show()
print(f"\nChart saved → {chart_path}")

print("\n" + "=" * 60)
print("Analysis complete.")
print("=" * 60)
