# TITAN-AI // 06. SAFETY RULES & ALGORITHMIC FORMULAS

This document details the exact mathematical formulas, sports science models, biomechanical geometry, and safety safeguards embedded within TITAN-AI's code.

---

## 1. Estimated 1-Repetition Maximum (e1RM) Formulations

TITAN-AI evaluates athlete e1RM across multiple validated models depending on repetition ranges:

### A. Wathan Formula (Optimal for 1 to 6 Repetitions)
$$\text{e1RM} = \frac{100 \times \text{Load}}{48.8 + (53.8 \times e^{-0.075 \times \text{Reps}})}$$
*Used as primary formula for heavy powerlifting compound top-sets.*

### B. Brzycki Formula (Standard Compound Baseline)
$$\text{e1RM} = \text{Load} \times \frac{36}{37 - \text{Reps}}$$
*Used for sets between 3 and 8 repetitions.*

### C. Epley Formula (High-Rep / Accessory Sets)
$$\text{e1RM} = \text{Load} \times \left(1 + \frac{\text{Reps}}{30}\right)$$
*Applied when evaluating accessory tonnage and higher-rep hypertrophy work (8-12 reps).*

---

## 2. Autoregulation: RPE to Reps-in-Reserve (RIR) Matrix

TITAN-AI implements the Mike Tuchscherer / Reactive Training Systems (RTS) RPE scale combined with percentage of 1RM mapping:

| RPE | Reps In Reserve (RIR) | Subjective Athlete Perception | % 1RM (Single) | % 1RM (Triple) |
| :--- | :--- | :--- | :--- | :--- |
| **10.0** | 0 RIR | Maximal effort. No reps left; bar speed grinded to threshold. | 100.0% | 92.2% |
| **9.5** | 0 - 1 RIR | Could not do another rep; could maybe add 1.25kg - 2.5kg. | 97.8% | 90.7% |
| **9.0** | 1 RIR | 1 definite repetition remaining in reserve. | 95.5% | 88.6% |
| **8.5** | 1 - 2 RIR | 1 rep left for sure; maybe 2 with high drive. | 93.9% | 87.1% |
| **8.0** | 2 RIR | 2 repetitions left in reserve. Crisp, solid speed. | 92.2% | 85.5% |
| **7.5** | 2 - 3 RIR | Bar moved with noticeable acceleration. | 90.7% | 84.0% |
| **7.0** | 3 RIR | Velocity is high. Standard working warmup or speed set. | 88.6% | 82.1% |
| **< 6.5** | 4+ RIR | Light technique work or exploratory warmup. | < 85.0% | < 80.0% |

---

## 3. Prilepin's Table for Powerlifting Volume Safety

To prevent central nervous system (CNS) overtraining during strength peaking, TITAN-AI's blueprint engine audits total working repetitions against Prilepin's powerlifting matrix:

| % 1RM Zone | Reps per Set | Optimal Total Reps | Safe Range Total Reps |
| :--- | :--- | :--- | :--- |
| **70% - 79%** | 3 - 6 reps | 18 reps | 12 - 24 reps |
| **80% - 89%** | 2 - 4 reps | 15 reps | 10 - 20 reps |
| **90%+** | 1 - 2 reps | 4 - 7 reps | 4 - 10 reps |

*Rule Enforcement*: If a generated program exceeds the upper threshold of Prilepin's safe range at >85% intensity, the engine automatically caps the number of sets to protect the lifter's connective tissue.

---

## 4. Biomechanical Computer Vision Geometric Formulas

The real-time computer vision pipeline (`cvEngine.js`) calculates four geometric properties from MediaPipe joint coordinates:

### A. Squat Depth Geometry (Knee vs Hip Crease)
Given 2D normalized coordinates for the Hip Landmark $(x_h, y_h)$ and Knee Joint Landmark $(x_k, y_k)$ (where $y$ increases downward in browser canvas coordinates):
$$\text{Depth Valid (Good Lift)} \iff y_h > y_k + \Delta_{\text{offset}}$$
- If the hip crease $y_h$ is strictly lower than the top plane of the knee joint $y_k$, the system triggers a **"WHITE LIGHT // DEPTH VALID"** green HUD indicator.
- If $y_h \le y_k$, it flags **"RED LIGHT // HIGH DEPTH"**.

### B. Bar Path Horizontal Moment Arm Leakage
Let $x_{\text{bar}}(t)$ be the horizontal position of the barbell and $x_{\text{midfoot}}$ be the mid-foot landmark:
$$\text{Horizontal Deviation } \delta(t) = |x_{\text{bar}}(t) - x_{\text{midfoot}}|$$
$$\text{Power Leakage \%} = \min\left(100, \; \frac{\max(\delta) - \min(\delta)}{L_{\text{femur}}} \times 100\right)$$
- Excessive horizontal drift indicates wasted energy against gravity and shearing stress on the lumbar spine.

### C. Concentric Velocity Loss Percentage
Let $V_1$ be the mean concentric velocity of Repetition 1, and $V_{\text{last}}$ be the velocity of the final repetition:
$$\text{Velocity Loss \%} = \left(\frac{V_1 - V_{\text{last}}}{V_1}\right) \times 100$$
- **Hypertrophy Threshold**: 20% to 30% velocity loss ensures recruitment of high-threshold motor units.
- **Powerlifting Peaking Cut-off**: If velocity loss exceeds 20% on a heavy strength set, the engine prompts the athlete to terminate the set to avoid excessive neural fatigue.

---

## 5. Hypertrophy Volume Landmarks (Bodybuilding Realm)

Based on Dr. Mike Israetel's Renaissance Periodization landmarks, the Bodybuilding world dynamically tracks weekly direct sets per muscle group:

| Landmark | Meaning | Weekly Set Range (per Muscle Group) |
| :--- | :--- | :--- |
| **MV (Maintenance Volume)** | Lowest volume to preserve current muscular size. | 6 - 8 direct sets/week |
| **MEV (Minimum Effective Volume)** | Minimum volume required to stimulate hypertrophy. | 10 - 12 direct sets/week |
| **MAV (Maximum Adaptive Volume)** | Optimal stimulus zone where athlete grows fastest. | 14 - 20 direct sets/week |
| **MRV (Maximum Recoverable Volume)** | Upper threshold; exceeding this leads to overtraining. | 22 - 26+ direct sets/week |

---

## 6. 9-for-9 Competition Attempt Selection Math

In `competitionAttemptEngine.js`, attempts are prescribed to optimize podium probability while ensuring 100% platform success:

1. **First Attempt (Opener - 90% to 92% of Peak e1RM)**:
   $$\text{Opener} = \text{RoundTo2.5kg}(\text{Peak 1RM} \times 0.91)$$
   *Must be a confident lift the athlete can hit in their sleep under high adrenaline.*
2. **Second Attempt (96% to 98% of Peak e1RM)**:
   $$\text{Second Attempt} = \text{RoundTo2.5kg}(\text{Peak 1RM} \times 0.97)$$
   *Sets a competition total PR or secures podium ranking.*
3. **Third Attempt (100% to 103% of Peak e1RM)**:
   $$\text{Third Attempt} = \text{RoundTo2.5kg}(\text{Peak 1RM} \times 1.015)$$
   *Maximal all-out attempt for podium victory or national record.*

---

## 7. Desi High-Protein Diet Optimization Formulas

To make elite sports nutrition accessible on a budget, TITAN-AI evaluates protein cost efficiency:

$$\text{Protein Efficiency Index (PEI)} = \frac{\text{Grams of Protein per 100g}}{\text{Cost per 100g in INR}}$$

### Comparative Indian Staples Ranking
1. **Soya Chunks**: 52g protein per 100g at ~₹15/100g $\rightarrow \mathbf{3.46\text{g protein / ₹1}}$ *(Ultimate Cost-Efficiency King)*.
2. **Whole Eggs**: 13g protein per 100g (2 eggs) at ~₹14 $\rightarrow \mathbf{0.93\text{g protein / ₹1}}$.
3. **Roasted Sattu**: 20g protein per 100g at ~₹18/100g $\rightarrow \mathbf{1.11\text{g protein / ₹1}}$.
4. **Low-Fat Paneer**: 18g protein per 100g at ~₹35/100g $\rightarrow \mathbf{0.51\text{g protein / ₹1}}$.
5. **Chicken Breast**: 31g protein per 100g at ~₹30/100g $\rightarrow \mathbf{1.03\text{g protein / ₹1}}$.

TITAN-AI dynamically synthesizes the athlete's daily meal plan to hit their chosen protein target (e.g., 140g) within their defined budget constraint (e.g., ₹150/day) using these exact ratios.
