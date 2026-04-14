# 42-transcendence - Design Documentation

This document contains the entire design process of Transcendence. From
the initial brainstorming, the different version iterations, until reaching the final version of the interface.

The goal of this process was to ensure the project’s functionalities for the production team.

## 1) Goals

- Create a clean and easy-to-use interface.
- A scalable component system (leaderboard, friends, etc.).
- Ensure that all components are responsive across different devices.
- Visual consistency between screens so the user experience is not disrupted.

## 2) USED TOOLS

- Excalidraw - initial wireframe design and navigation planning.
- Pinterest - search for inspiration for the design, typography, and colors. Definition of the visual direction.
- Figma - creation of a high-fidelity interactive prototype for the final project.

## 3) DESIGN PROCESS

- The document [screens.md](../specs/screens.md) that was defined, helped us to guide the project’s screens and initial navigation.
- [Excalidraw](https://excalidraw.com/#room=00f98bec6feaa0cc8ab8,qQ5xBBPlmRWLLHn-8Y7kvw): wireframe design indicating the content of each screen, created for both desktop and mobile devices. We mapped each user navigation path until reaching the game. This also helped us visualize which components could be reusable.

- [Figma](https://www.figma.com/design/JGZDXOGPzuav1hkCpGV0Mb/Ft_transcendence?node-id=165-3&p=f&t=a35uZBRaZrDKCKTy-0): once everything was planned, we started working in Figma with a Design System, where we precisely defined buttons, avatars, progress bars, etc. Everything was designed with scalability and responsiveness in mind, using tools such as auto-layout, components, and their variants.

  ### DESGIN SYSTEM

  #### Fonts

        H1 >> Bungee (72px, 60px).
        H2 >> Sansita (12px,14px,32px, etc).

  #### Buttons

        Size >> w-141px/ h-50px
        Primary colors:
            active: #9333EA
            hover: #B586D7
            pressed: #D0BCFF
            inactive: #C5C5C5

  To see a more detailed definition of styles, you can see the project page.
  Also, you would find some futures features.

  ***

  Once this part was completed, we started to integrate the design to the project.
