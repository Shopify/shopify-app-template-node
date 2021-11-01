import { ResourceItem, ResourceList, TextStyle } from "@shopify/polaris";
import React from "react";

export function ProductsList({ data }) {
  return (
    <ResourceList
      showHeader
      resourceName={{ singular: "product", plural: "products" }}
      items={data}
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
