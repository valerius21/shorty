import {
  ApolloClient,
  ApolloProvider,
  gql,
  InMemoryCache,
  useMutation,
} from "@apollo/client";
import React, { useState } from "react";
import { Input } from "react-rainbow-components";
import "./App.css";

const client = new ApolloClient({
  uri: "http://localhost:5000/graphql",
  cache: new InMemoryCache(),
});

const NEW_URL = gql`
  mutation NewURL($url: String!) {
    newURL(options: { url: $url }) {
      errors {
        field
        message
      }
      url {
        shorthand
      }
      secret
    }
  }
`;

const App = () => {
  const [, setLoading] = useState(false);
  const [newURL, _] = useMutation(NEW_URL, { client });
  const [urlResponse, setUrlResponse] = useState<any>(null);
  let timer: NodeJS.Timeout | null = null;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    const { value } = event.target;
    clearTimeout(timer!);
    timer = setTimeout(() => {
      console.log(value);
      newURL({ variables: { url: value } })
        .then((res) => {
          setUrlResponse(res.data);
        })
        .then(() => setLoading(false))
        .catch(console.error);
    }, 1000);
  };

  return (
    <ApolloProvider client={client}>
      <div id="app">
        <h1>🔥 Make your URLs shorter! 💪</h1>
        <Input
          id="url-input"
          label="✂️ URL to shorten ✂️"
          isCentered
          onChange={handleChange}
          placeholder="https://google.com/..."
          className="input-container"
        />
        {urlResponse.newURL.errors === null && (
          <>
            <h2>Short URL</h2>
            <p>{`http://${window.location.host}/${urlResponse.newURL.url.shorthand}`}</p>
            <h2>Secret to edit that URL</h2>
            <p>
              <code>{urlResponse.newURL.secret}</code>
            </p>
          </>
        )}
      </div>
    </ApolloProvider>
  );
};

export default App;
