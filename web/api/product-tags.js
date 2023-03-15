import shopify from "../shopify.js";

export async function getTags(req, res) {
  const client = new shopify.api.clients.Graphql({
    session: res.locals.shopify.session,
  });

  // for now, update the first product
  const response = await client.query({
    data: {
      query: GET_TAGS_QUERY,
    },
  });

  console.log(response);

  const tags =
    response?.body?.data?.shop?.productTags?.edges?.map((edge) => edge.node) ||
    [];

  res.status(200).send({ success: true, tags: tags });
}

export async function addTags(req, res) {
  const client = new shopify.api.clients.Graphql({
    session: res.locals.shopify.session,
  });

  // for now, update the first product
  const response = await client.query({
    data: {
      query: ADD_TAGS_QUERY,
      variables: {
        id: req.body.products[0],
        tags: req.body.tags,
      },
    },
  });

  res.status(200).send({ success: true, tags: req.body.tags });
}

export async function deleteTags(req, res) {
  const client = new shopify.api.clients.Graphql({
    session: res.locals.shopify.session,
  });

  // for now, update the first product
  const response = await client.query({
    data: {
      query: REMOVE_TAGS_QUERY,
      variables: {
        id: req.body.products[0],
        tags: req.body.tags,
      },
    },
  });

  res.status(200).send({ success: true, tags: req.body.tags });
}

const GET_TAGS_QUERY = `#graphql
{
	shop {
    productTags(first: 50) {
      edges {
        node
      }
    }
  }
}
`;

const ADD_TAGS_QUERY = `#graphql
  mutation tagsAdd($id: ID!, $tags: [String!]!) {
    tagsAdd(id: $id, tags: $tags) {
      node {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const REMOVE_TAGS_QUERY = `#graphql
  mutation tagsRemove($id: ID!, $tags: [String!]!) {
  tagsRemove(id: $id, tags: $tags) {
    node {
      id
    }
    userErrors {
      field
      message
    }
  }
}
`;
