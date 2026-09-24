# angor-root.github.io

Personal site of **Caleb Churata**, Mechatronics Engineering student and
Robotics Student Fellow at the Robotic Systems Lab, ETH Zürich.

Live at **<https://angor-root.github.io>**.

A hand-written static site: no framework, no build step, no generator. Three
HTML pages, two stylesheets and two scripts, deployed as-is.

## Pages

| Path         | What it is                                                                 |
| ------------ | -------------------------------------------------------------------------- |
| `/`          | Portfolio: Robot Lab (3D A2 viewer), experience, projects, CV              |
| `/robotics/` | Curated robotics resources, a NotebookLM audio companion, 1:1 mentoring    |
| `/cv/`       | Full CV in HTML; the PDF lives in `assets/cv/`                              |
| `/legal/`    | Privacy notice and the terms of the mentoring session                      |

## Layout

```
index.html            portfolio
robotics/index.html   robotics resources
cv/index.html         CV
legal/index.html      privacy and terms
404.html              not-found page, served by GitHub Pages
css/tokens.css        design system: paper/ink palette, type scale, buttons
css/layout.css        portfolio sections
css/robotics.css      resources page
js/main.js            scroll reveal, mobile nav
js/robot-viewer.js    URDF viewer, replays recorded /joint_states trajectories
assets/robot/a2/      Unitree A2 URDF + meshes
assets/robot/traj/    joint trajectories extracted from real rosbags
scripts/              trajectory extraction, CV PDF generation
```

## The Robot Lab viewer

`js/robot-viewer.js` loads the real A2 URDF with `three.js` + `urdf-loader` and
drives it from JSON trajectories in `assets/robot/traj/`. Those come from my own
test rosbags via `scripts/extract_trajectory.py`. It is a replay of motion that
actually happened, not a physics simulation.

## Design system

One accent (`#C1571A`), paper (`#F5F3EE`) and ink (`#101112`); Fraunces for
display, Inter for text, JetBrains Mono for labels. All of it lives in
`css/tokens.css`. Change a token there and the whole site follows.

## Running it locally

No dependencies. Any static server works:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

The CV PDF is regenerated separately:

```bash
cd scripts && npm install && node gen_cv_pdf.js
```

## Deployment

GitHub Pages serves the `main` branch directly. There is no build step and no
workflow: push and it is live. `.nojekyll` keeps Pages from running the site
through Jekyll.

## License

Code is MIT, see [LICENSE](LICENSE). Personal content is not: the CV, the
photographs, the video footage and the recorded trajectories under `assets/`
remain © Caleb Churata. Reuse the code freely; ask before reusing the content.
