import { Link, useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();
  return (
    <div className="container">
      <h1>Something went wrong</h1>
      <p>{error?.message || "Unknown error"}</p>
      <Link to="/">Back to Home</Link>
    </div>
  );
}
