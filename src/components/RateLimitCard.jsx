import { useEffect, useState, useCallback } from "react";
import {
  Card,
  Heading,
  TextContainer,
  DisplayText,
  TextStyle,
  Button,
} from "@shopify/polaris";

import { gql, useLazyQuery } from "@apollo/client";

const PRODUCTS_QUERY = gql`
  {
    products(first: 100) {
      edges {
        cursor
        node {
          id
          title
          onlineStoreUrl
        }
      }
    }
  }
`;

export function RateLimitCard() {
  const [productQuery, { loading }] = useLazyQuery(PRODUCTS_QUERY)
  const [rateLimitMessage, setRateLimitMessage] = useState('')

  const beginRateLimit = useCallback(() => {
    for (let index = 0; index < 1500; index++) {
      setRateLimitMessage(`Query: ${index}`)
      productQuery({variables: {time: Date.now().toString()}});// adding date as unused var prevents request caching
    }
  }, [])

  return (
    <>
      <Card title="Rate Limit" sectioned>
        <TextContainer spacing="loose">
          <p>
            {rateLimitMessage}
          </p>
          <Button
            primary
            loading={loading}
            onClick={beginRateLimit}
          >
            Begin Rate Limit Test
          </Button>
        </TextContainer>
      </Card>
    </>
  );
}

