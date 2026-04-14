# Install Next.js

```
npm install react@latest react-dom@latest next@latest
npm install -g pnpm # faster than npm
npm install tailwindcss @tailwindcss/postcss postcss
npm i --save @fortawesome/react-fontawesome@latest
npm i --save @fortawesome/fontawesome-svg-core
npm install js-cookie
npm run dev #create server for runing just front
```

# TailwindCSS Docs
> [Installation for Next.js](https://tailwindcss.com/docs/installation/framework-guides/nextjs)
 <br>
> [Inline Classes Documentation](https://tailwindcss.com/docs/aspect-ratio)

# Next.js Docs

> [Starter Documentation](https://nextjs.org/docs)
 <br>
> [React Foundations Course (Before Next.js)](https://nextjs.org/learn/react-foundations)
<br>
> [Next.js Foundation Course](https://nextjs.org/learn/dashboard-app)


# DOCKER

```
docker build -t frontend .  # Build de container, just once after doing git pull
docker run -p 3000:3000 frontend   # Runs the container, npm is in the background as pid 1
```

```
Browser -> http://localhos:3000/
```