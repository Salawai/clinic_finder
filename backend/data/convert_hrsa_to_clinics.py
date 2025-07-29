import csv
import json

def clean(value, fallback=""):
    if value is None:
        return fallback
    val = str(value).strip()
    return fallback if val.lower() == "nan" else val

def infer_cost(row):
    if (
        clean(row.get("Health Center Type")) == "Federally Qualified Health Center (FQHC)"
        or clean(row.get("Health Center Location Type Description")) == "Mobile Van"
        or clean(row.get("Health Center Operator Description")) == "Health Center/Applicant"
    ):
        return "Sliding Scale (based on income)"
    return "Unknown"

def infer_services(row):
    desc = clean(row.get("Health Center Service Delivery Site Location Setting Description")).lower()
    if "dental" in desc:
        return "Dental"
    elif "mental" in desc or "behavioral" in desc:
        return "Behavioral Health"
    elif "women" in desc:
        return "Women's Health"
    elif "primary" in desc:
        return "Primary Care"
    elif "clinic" in desc:
        return "General Clinic"
    else:
        return "Other"

def process_hrsa_csv(input_csv, output_json):
    clinics = []

    with open(input_csv, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            if clean(row.get("Site Status Description")) != "Active":
                continue
            if clean(row.get("Site State Abbreviation")) not in {
                "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA",
                "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH",
                "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
            }:
                continue

            try:
                lat = float(row.get("Geocoding Artifact Address Primary Y Coordinate"))
                lng = float(row.get("Geocoding Artifact Address Primary X Coordinate"))
            except (TypeError, ValueError):
                continue  # Skip if lat/lng are missing or invalid

            clinic = {
                "name": clean(row.get("Site Name")),
                "address": f"{clean(row.get('Site Address'))}, {clean(row.get('Site City'))}, {clean(row.get('Site State Abbreviation'))} {clean(row.get('Site Postal Code'))}",
                "city": clean(row.get("Site City")),
                "zip": clean(row.get("Site Postal Code"))[:5],
                "phone": clean(row.get("Site Telephone Number")),
                "lat": lat,
                "lng": lng,
                "cost": infer_cost(row),
                "services": infer_services(row),
                "hours": clean(row.get("Operating Hours per Week"), "Unknown"),
                "website": clean(row.get("Site Web Address"), "")
            }
            clinics.append(clinic)

    with open(output_json, "w", encoding='utf-8') as f:
        json.dump(clinics, f, indent=2)

    print(f"✅ Wrote {len(clinics)} clinics to {output_json}")

# ✅ Run the conversion
process_hrsa_csv("Health_Center_Service_Delivery_and_LookAlike_Sites.csv", "clinics.json")