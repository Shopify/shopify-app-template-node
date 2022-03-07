import { ResourceItem, ResourceList, TextStyle } from "@shopify/polaris";

export function ProductsList({ products }) {
  return (
    <ResourceList
      showHeader
      resourceName={{ singular: "product", plural: "products" }}
      items={products}
      renderItem={({ id, title, onlineStoreUrl }) => (
        <ResourceItem id={id} accessibilityLabel={`View details for ${title}`}>
          <h3>
            <TextStyle variation="strong">{title}</TextStyle>
          </h3>
        </ResourceItem>
      )}
    />
  );
}
