import app from "./src/app";

const port = Bun.env.PORT ?? 3001;

const anhaoElysia = app.listen(port, () => {
  if (Bun.env.NODE_ENV === "development") {
    console.log(`Server is running on http://localhost:${port}`);
  } else if (Bun.env.NODE_ENV === "production") {
    console.log(`Server is running on port ${port}`);
  } else {
    console.log(
      `Server is running on port:${port} in ${Bun.env.NODE_ENV} mode`
    );
  }
});

export type AnhaoElysia = typeof anhaoElysia;
