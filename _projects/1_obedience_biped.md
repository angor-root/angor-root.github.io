---
layout: page
title: Obedience — Bipedal Robot
description: A software architecture for autonomous bipedal delivery, applying capture-point control theory from the literature
img:
importance: 1
category: research
---

**Obedience** is an autonomous bipedal robot designed to deliver medications to patient bedsides on a schedule. The project's core contribution is its **software architecture**: a "constellation" of ROS 2 nodes that applies capture-point control theory, published in the humanoid push-recovery literature, to a concrete, fault-tolerant delivery task.

### Architecture

Rather than a single monolithic controller, the system is decomposed into independent, communicating nodes — mission planning, navigation, battery management, and locomotion each own a narrow responsibility, coordinated over ROS 2 topics/services:

```
┌─────────────────────────────────────────────────────────────┐
│                   OBEDIENCE CONSTELLATION                     │
├─────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐       │
│   │   Mission   │    │  Navigation │    │   Battery   │       │
│   │   Planner   │────│  Controller │────│   Monitor   │       │
│   └─────────────┘    └─────────────┘    └─────────────┘       │
│          │                  │                  │              │
│          └──────────────────┼──────────────────┘              │
│                             │                                  │
│                    ┌────────┴────────┐                        │
│                    │     Walking     │                        │
│                    │   Controller    │                        │
│                    │ (Capture Point) │                        │
│                    └─────────────────┘                        │
│                             │                                  │
│                    ┌────────┴────────┐                        │
│                    │      Robot      │                        │
│                    │    Hardware     │                        │
│                    └─────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

### Methodology — applying the literature

The walking controller implements the **Capture Point** method: the theory that a biped can be modeled as a linear inverted pendulum, and that there exists a "capture point" on the ground where, if the foot is placed, the robot can come to a stop without taking another step. This gives dynamically stable walking without solving a full trajectory-optimization problem online — a good fit for a low-cost, real-time delivery robot. The controller computes optimal foot placement from inverted-pendulum dynamics (`capture_point.py`, with kinematics via `jacobian.py`), following Pratt et al., *"Capture Point: A Step toward Humanoid Push Recovery."*

The rest of the constellation applies that same stability guarantee at the system level: the **Battery Monitor** verifies charge before a trip and predicts reach from discharge rate, the **Mission Planner** schedules deliveries around it, and if the walking controller ever can't guarantee a safe capture point (e.g., low battery mid-route), the robot falls back to a safe sit-down posture instead of failing ungracefully.

### Stack

Python · ROS 2 (Humble+) · MuJoCo (simulation) · Pinocchio (kinematics) · URDF

Code: [github.com/angor-root/Obedience-Biped-a-Thinking-Autonomous-System](https://github.com/angor-root/Obedience-Biped-a-Thinking-Autonomous-System)
