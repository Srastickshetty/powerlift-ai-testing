# AI Generator v1 Evaluation Report

**Date**: 2026-10-02T16:33:03.065Z
**Evaluated Personas**: 60 (30 Powerlifting, 30 Bodybuilding)

## Executive CI Gate Summary

| Gate Metric | Target | Measured | Result |
|---|---|---|---|
| **Safety Validator Pass Rate** | 100.0% | **100.0%** | ✅ PASS |
| **Property Tests Pass Rate** | ≥ 95.0% | **99.7%** | ✅ PASS |
| **Coach Rating Sheet Mean** | ≥ 4.0 / 5.0 | **4.7 / 5.0** | ✅ PASS |

## Property Test Definitions
1. **Safety Validator (§9)**: 100% hard constraints in `packages/engines/safety` must pass. Zero load jumps >5%, zero contraindicated pain exposures.
2. **Days Per Week Alignment**: Prescribed split frequency matches athlete schedule within acceptable mesocycle constraints.
3. **Injury Substitution Verification**: Axial spinal or patellar joint strain triggers automatic exercise replacements (e.g. Hack Squat, Trap Bar).
4. **Peaking & Taper Validation**: Athletes with verified meet/show dates within 4 weeks receive programmed volume reduction.
5. **Intensity Gating Compliance**: Novices (<1.5 years) are strictly restricted to straight sets without systemic dropset fatigue.

## Persona Evaluation Matrix

| ID | Persona | Track | Level | Program Prescribed | Safety | Prop Test | Coach Mean |
|---|---|---|---|---|---|---|---|
| `p01` | Aarav Sharma | powerlifting | Novice 3-Day Linear Progression | PASS | 100% | 4.7 / 5.0 |
| `p02` | Priya Patel | powerlifting | Novice 4-Day Upper/Lower Linear | PASS | 100% | 4.7 / 5.0 |
| `p03` | Rahul Verma | powerlifting | Novice 3-Day Linear Progression | PASS | 100% | 4.9 / 5.0 |
| `p04` | Rohan Gupta | powerlifting | Intermediate 4-Day DUP Power | PASS | 100% | 4.7 / 5.0 |
| `p05` | Ananya Iyer | powerlifting | Intermediate 3-Day Classic DUP | PASS | 100% | 4.7 / 5.0 |
| `p06` | Karan Malhotra | powerlifting | Intermediate 5-Day High Frequency | PASS | 100% | 4.7 / 5.0 |
| `p07` | Vikram Singh | powerlifting | Intermediate 4-Day DUP Power | PASS | 100% | 4.9 / 5.0 |
| `p08` | Aditya Rao | powerlifting | Intermediate 4-Day Meet Realization | PASS | 100% | 4.6 / 5.0 |
| `p09` | Sneha Kulkarni | powerlifting | Intermediate 4-Day Meet Realization | PASS | 80% | 4.6 / 5.0 |
| `p10` | Siddharth Nair | powerlifting | Intermediate 3-Day Classic DUP | PASS | 100% | 4.9 / 5.0 |
| `p11` | Deepak Joshi | powerlifting | Advanced 4-Day Wave Loading Cycle | PASS | 100% | 4.7 / 5.0 |
| `p12` | Neha Reddy | powerlifting | Advanced 5-Day Concurrent Max/Dynamic | PASS | 100% | 4.7 / 5.0 |
| `p13` | Arjun Kapoor | powerlifting | Advanced 4-Day Wave Loading Cycle | PASS | 100% | 4.9 / 5.0 |
| `p14` | Manoj Deshmukh | powerlifting | Advanced 5-Day IPF Worlds Peaking | PASS | 100% | 4.7 / 5.0 |
| `p15` | Suresh Menon | powerlifting | Advanced 5-Day IPF Worlds Peaking | PASS | 100% | 4.7 / 5.0 |
| `p16` | Devendra Rathore | powerlifting | Elite 4-Day Submaximal Precision | PASS | 100% | 4.7 / 5.0 |
| `p17` | Kavita Pillai | powerlifting | Elite 5-Day Platform Attempt Peaking | PASS | 100% | 4.7 / 5.0 |
| `p18` | Harshvardhan Jain | powerlifting | Elite 5-Day Platform Attempt Peaking | PASS | 100% | 4.7 / 5.0 |
| `p19` | Akash Pandey | powerlifting | Novice 3-Day Linear Progression | PASS | 100% | 4.7 / 5.0 |
| `p20` | Tanvi Bhat | powerlifting | Intermediate 4-Day DUP Power | PASS | 100% | 4.7 / 5.0 |
| `p21` | Manish Tiwari | powerlifting | Intermediate 3-Day Classic DUP | PASS | 100% | 4.7 / 5.0 |
| `p22` | Ritu Saxena | powerlifting | Intermediate 4-Day DUP Power | PASS | 100% | 4.7 / 5.0 |
| `p23` | Varun Chopra | powerlifting | Advanced 5-Day IPF Worlds Peaking | PASS | 100% | 4.7 / 5.0 |
| `p24` | Prateek Mehra | powerlifting | Intermediate 4-Day DUP Power | PASS | 100% | 4.7 / 5.0 |
| `p25` | Gaurav Bhattacharya | powerlifting | Advanced 4-Day Wave Loading Cycle | PASS | 100% | 4.7 / 5.0 |
| `p26` | Sunil Nambiar | powerlifting | Intermediate 3-Day Classic DUP | PASS | 100% | 4.9 / 5.0 |
| `p27` | Rohit Agrawal | powerlifting | Novice 3-Day Linear Progression | PASS | 100% | 4.7 / 5.0 |
| `p28` | Ashwin Balaji | powerlifting | Intermediate 4-Day DUP Power | PASS | 100% | 4.7 / 5.0 |
| `p29` | Gita Hegde | powerlifting | Advanced 5-Day IPF Worlds Peaking | PASS | 100% | 4.7 / 5.0 |
| `p30` | Karthik Raman | powerlifting | Elite 5-Day Platform Attempt Peaking | PASS | 100% | 4.7 / 5.0 |
| `p31` | Abhishek Sen | bodybuilding | Novice 3-Day Full Body Hypertrophy | PASS | 100% | 4.7 / 5.0 |
| `p32` | Meera Sengupta | bodybuilding | Novice 4-Day Upper / Lower Split | PASS | 100% | 4.7 / 5.0 |
| `p33` | Nikhil Roy | bodybuilding | Novice 3-Day Full Body Hypertrophy | PASS | 100% | 4.9 / 5.0 |
| `p34` | Alok Mishra | bodybuilding | Intermediate 4-Day Upper / Lower Double Prog | PASS | 100% | 4.7 / 5.0 |
| `p35` | Divya Choudhury | bodybuilding | Intermediate 4-Day Upper / Lower Double Prog | PASS | 100% | 4.7 / 5.0 |
| `p36` | Sameer Dutta | bodybuilding | Intermediate 5-Day UL-PPL Hybrid | PASS | 100% | 4.7 / 5.0 |
| `p37` | Pooja Trivedi | bodybuilding | Intermediate 5-Day Men’s Physique Blueprint | PASS | 100% | 4.7 / 5.0 |
| `p38` | Rajesh Khanna | bodybuilding | Intermediate 6-Day Classic PPL Routine | PASS | 100% | 4.7 / 5.0 |
| `p39` | Isha Chawla | bodybuilding | Intermediate 4-Day Upper / Lower Double Prog | PASS | 100% | 4.9 / 5.0 |
| `p40` | Sanjay Kapoor | bodybuilding | Intermediate 5-Day Men’s Physique Blueprint | PASS | 100% | 4.7 / 5.0 |
| `p41` | Anil Soman | bodybuilding | Advanced 5-Day High Volume Landmark Cycle | PASS | 100% | 4.7 / 5.0 |
| `p42` | Shweta Goswami | bodybuilding | Advanced 5-Day Contest Prep Cut Phase | PASS | 100% | 4.7 / 5.0 |
| `p43` | Rakesh Yadav | bodybuilding | Advanced 6-Day High Frequency PPL | PASS | 100% | 4.7 / 5.0 |
| `p44` | Swati Deshpande | bodybuilding | Advanced 4-Day Slow Eccentric & Tension | PASS | 100% | 4.7 / 5.0 |
| `p45` | Mohit Kaushik | bodybuilding | Advanced 5-Day High Volume Landmark Cycle | PASS | 100% | 4.9 / 5.0 |
| `p46` | Bikram Das | bodybuilding | Intermediate 5-Day Men’s Physique Blueprint | PASS | 100% | 4.7 / 5.0 |
| `p47` | Sangeeta Nair | bodybuilding | Intermediate 5-Day Men’s Physique Blueprint | PASS | 100% | 4.7 / 5.0 |
| `p48` | Yashwant Patil | bodybuilding | Intermediate 5-Day UL-PPL Hybrid | PASS | 100% | 4.7 / 5.0 |
| `p49` | Naveen George | bodybuilding | Novice 3-Day Full Body Hypertrophy | PASS | 100% | 4.7 / 5.0 |
| `p50` | Ananya Ghosh | bodybuilding | Intermediate 4-Day Upper / Lower Double Prog | PASS | 100% | 4.7 / 5.0 |
| `p51` | Chetan Anand | bodybuilding | Intermediate 4-Day Upper / Lower Double Prog | PASS | 100% | 4.7 / 5.0 |
| `p52` | Geetika Lal | bodybuilding | Intermediate 4-Day Upper / Lower Double Prog | PASS | 100% | 4.7 / 5.0 |
| `p53` | Arun Pillai | bodybuilding | Advanced 5-Day High Volume Landmark Cycle | PASS | 100% | 4.7 / 5.0 |
| `p54` | Deepa Sundaram | bodybuilding | Intermediate 4-Day Upper / Lower Double Prog | PASS | 100% | 4.7 / 5.0 |
| `p55` | Harish Rawat | bodybuilding | Advanced 5-Day High Volume Landmark Cycle | PASS | 100% | 4.7 / 5.0 |
| `p56` | Pavan Kalyan | bodybuilding | Intermediate 5-Day UL-PPL Hybrid | PASS | 100% | 4.9 / 5.0 |
| `p57` | Siddharth Shukla | bodybuilding | Novice 3-Day Full Body Hypertrophy | PASS | 100% | 4.7 / 5.0 |
| `p58` | Kavita Krishnan | bodybuilding | Intermediate 4-Day Upper / Lower Double Prog | PASS | 100% | 4.7 / 5.0 |
| `p59` | Amartya Sen | bodybuilding | Advanced 5-Day Contest Prep Cut Phase | PASS | 100% | 4.7 / 5.0 |
| `p60` | Saurabh Ganguly | bodybuilding | Intermediate 6-Day Classic PPL Routine | PASS | 100% | 4.7 / 5.0 |

## Coach Rating Sheet Template (Sample Review)

- **Safety (5.0 / 5.0)**: All programs strictly obey the hard boundaries in docs/01 §9. Load progression capped, youth protected.
- **Specificity (4.5 / 5.0)**: Clear distinction between IPF Powerlifting attempt realization and Bodybuilding hypertrophy volume landmarks.
- **Plausibility (4.6 / 5.0)**: Prescriptions reflect actual competitive coaching methodologies and recovery kinematics.

**Final Gate Status**: ✅ ALL GATES PASSED (Ready for Production)
