import { ResourceItem, ResourceList, TextStyle } from "@shopify/polaris";
import React from "react";

export function ProductsList({ data }) {
  const products = data.products.edges.map((edge) => {
    return {
      id: edge.node.id,
      title: edge.node.title,
    };
  });
  return (
    <ResourceList
      showHeader
      resourceName={{ singular: "product", plural: "products" }}
      items={products}
      renderItem={({ id, title }) => {
        return (
          <ResourceItem
            id={id}
            accessibilityLabel={`View details for ${title}`}
          >
            <h3>
              <TextStyle variation="strong">{title}</TextStyle>
            </h3>
          </ResourceItem>
        );
      }}
    />
  );
}
