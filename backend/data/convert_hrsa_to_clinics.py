import csv
import json
import re

def clean(value, fallback=""):
    if value is None:
        return fallback
    val = str(value).strip()
    return fallback if val.lower() == "nan" else val

def infer_insurance_payment(row):
    payments = []
    type_ = clean(row.get("Health Center Type"))
    location_type = clean(row.get("Health Center Location Type Description"))
    operator = clean(row.get("Health Center Operator Description"))
    medicare = clean(row.get("FQHC Site Medicare Billing Number"))
    npi = clean(row.get("FQHC Site NPI Number"))

    if type_ == "Federally Qualified Health Center (FQHC)" or location_type == "Mobile Van" or operator == "Health Center/Applicant":
        payments.append("Sliding Scale (based on income)")
    if re.fullmatch(r"[A-Za-z0-9]{6,}", medicare):  # crude Medicare Billing Number check
        payments.append("Accepts Medicare")
    if re.fullmatch(r"\d{10}", npi):  # NPI = 10-digit number
        payments.append("Accepts Medicaid")

    return payments if payments else ["Unknown"]

def infer_services(row):
    fields_to_check = [
        clean(row.get("Site Name")).lower(),
        clean(row.get("Health Center Name")).lower(),
        clean(row.get("Health Center Service Delivery Site Location Setting Description")).lower()
    ]
    joined = " ".join(fields_to_check)

    services = []

    if re.search(r"mental|behavioral", joined):
        services.append("Behavioral Health")
    if re.search(r"women", joined):
        services.append("Women's Health")
    if re.search(r"dental", joined):
        services.append("Dental")
    if re.search(r"vision|eye", joined):
        services.append("Vision")
    if re.search(r"primary", joined):
        services.append("Primary Care")
    if re.search(r"urgent|walk[-\s]?in", joined):
        services.append("Urgent Care")
    if re.search(r"immun|vaccine", joined):
        services.append("Immunizations")
    if re.search(r"family", joined):
        services.append("Family Medicine")
    if re.search(r"repro|obgyn", joined):
        services.append("Reproductive Health")

    if not services:
        services.append("General Clinic")

    return sorted(set(services))

def infer_hours_label(hours_str):
    try:
        hours = float(hours_str)
    except (TypeError, ValueError):
        return "Unknown"

    if hours <= 10:
        return "Very Limited"
    elif hours <= 24:
        return "Limited Availability"
    elif hours <= 40:
        return "Standard Hours"
    else:
        return "Extended Hours"

def convert_hrsa_to_clinics(input_csv, output_json):
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
                continue

            hours_raw = clean(row.get("Operating Hours per Week"))

            clinic = {
                "name": clean(row.get("Site Name")),
                "address": f"{clean(row.get('Site Address'))}, {clean(row.get('Site City'))}, {clean(row.get('Site State Abbreviation'))} {clean(row.get('Site Postal Code'))}",
                "city": clean(row.get("Site City")),
                "zip": clean(row.get("Site Postal Code"))[:5],
                "phone": clean(row.get("Site Telephone Number")),
                "lat": lat,
                "lng": lng,
                "insurance_payment": infer_insurance_payment(row),
                "services": infer_services(row),
                "hours_label": infer_hours_label(hours_raw),
                "website": clean(row.get("Site Web Address"))
            }
            clinics.append(clinic)

    with open(output_json, "w", encoding='utf-8') as f:
        json.dump(clinics, f, indent=2)

    print(f"✅ Wrote {len(clinics)} clinics to {output_json}")

# ✅ Run the conversion
convert_hrsa_to_clinics("Health_Center_Service_Delivery_and_LookAlike_Sites.csv", "clinics.json")