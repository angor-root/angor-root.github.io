---
layout: page
title: Obedience — Bipedal Robot
description: Capture-point bipedal walking, ROS 2, MuJoCo, Pinocchio
img:
importance: 1
category: research
---

**Obedience** is an autonomous bipedal robot designed to deliver medications to patient bedsides on a schedule, integrating capture-point-based walking control with intelligent power management and fault-tolerant behaviors.

- Bipedal locomotion based on the **Capture Point** control method — dynamically stable walking without complex trajectory optimization.
- Built as a ROS 2 "constellation" architecture: mission planner, navigation controller, battery monitor, and walking controller.
- Simulated in MuJoCo, with kinematics via Pinocchio.
- Battery-aware behaviors: pre-trip charge verification, automatic return-to-charger, anomalous discharge detection, and a safe sit-down posture for graceful degradation.

Code: [github.com/angor-root/Obedience-Biped-a-Thinking-Autonomous-System](https://github.com/angor-root/Obedience-Biped-a-Thinking-Autonomous-System)
