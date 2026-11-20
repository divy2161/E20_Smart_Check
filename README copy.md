# E20 Check (React + Vite)

Tells you whether a petrol vehicle can run E20 (20% ethanol) and the highest blend it can take.

## Run
    npm install
    npm run dev      # development server
    npm run build    # production build in dist/

## Structure
- src/evaluate.js          the compatibility rules (pure function, easy to test)
- src/App.jsx              page layout and the vehicle form
- src/components/Result    verdict, blend ladder, tips
- src/components/Gauge     animated SVG gauge
- src/components/Calculator  mileage and cost estimate
- src/index.css            all styling (light and dark themes)

Guide only: always confirm with the owner's manual or the manufacturer.
