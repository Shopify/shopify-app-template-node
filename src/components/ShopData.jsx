import { gql, useQuery } from "@apollo/client";
import { Loading } from "@shopify/app-bridge-react";
import { Banner, DescriptionList } from "@shopify/polaris";

const SHOP_QUERY = gql`
  query {
    shop {
      name
      description
      url
    }
  }
`;

export function ShopData() {
  const { loading, error, data } = useQuery(SHOP_QUERY);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <Banner status="critical">There was an issue loading shop data.</Banner>
    );
  }

  return (
    <DescriptionList
      spacing="tight"
      items={[
        {
          term: "Name",
          description: data.shop.name,
        },
        {
          term: "Description",
          description: data.shop.description,
        },
        {
          term: "URL",
          description: data.shop.url,
        },
      ]}
    />
  );
}
