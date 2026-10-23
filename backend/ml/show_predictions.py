
from ml.predict import predict_top_crops

results = predict_top_crops(90, 42, 43, 20.5, 80, 6.5, 200)

print("\n" + "=" * 46)
print("       SMARTCROP AI PRO")
print("     CROP RECOMMENDATION RESULTS")
print("=" * 46)
print(f"{'RANK':<8}{'CROP':<20}{'SUITABILITY':>15}")
print("-" * 46)

for rank, item in enumerate(results, start=1):
    print(f"{rank:<8}{item['crop'].capitalize():<20}{item['suitability']:>12.2f}%")

print("=" * 46)
