# generate_codes.py
import random, string, json, datetime, argparse

def gen_segment(n=4):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=n))

def gen_code(prefix="QP52", segs=(4,4)):
    parts = [prefix]
    for s in segs:
        parts.append(gen_segment(s))
    return '-'.join(parts)

def main(out="codes.json", total=100, paid_ratio=0.3):
    codes = []
    paid_count = int(total*paid_ratio)
    for i in range(total):
        c = gen_code()
        ctype = "paid" if i < paid_count else "free"
        codes.append({
            "code": c,
            "type": ctype,
            "notes": "",
            "expires": None,
            "used": False
        })
    payload = {
        "generatedAt": datetime.datetime.utcnow().isoformat()+"Z",
        "count": len(codes),
        "codes": codes
    }
    with open(out, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
    print(f"Wrote {len(codes)} codes to {out}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", default="codes.json")
    parser.add_argument("--total", type=int, default=100)
    parser.add_argument("--paid-ratio", type=float, default=0.3)
    args = parser.parse_args()
    main(out=args.out, total=args.total, paid_ratio=args.paid_ratio)
