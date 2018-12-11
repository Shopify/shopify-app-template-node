export async function processPayment(ctx, next) {
  if (ctx.query.charge_id) {
    const options = {
      credentials: 'include',
      headers: {
        'X-Shopify-Access-Token': ctx.session.accessToken,
        'Content-Type': 'application/json',
      },
      method: 'GET',
    };
    await fetch(
      `https://${ctx.session.shop}/admin/recurring_application_charges/${
          ctx.query.charge_id
        }.json`,
      options,
    )
      .then((response) => response.json())
      .then((response) => {
        if (response.recurring_application_charge.status === 'accepted') {
          const activateOptions = { ...options, method: 'POST', body: JSON.stringify(response) }
          fetch(`https://${ctx.session.shop}/admin/recurring_application_charges/${ctx.query.charge_id}/activate.json`, activateOptions)
            .then((response) => response.json())
            .catch((error) => console.log('error', error));
        } else {
          return ctx.redirect('/')
        }
      });

    return ctx.redirect('/');
  } else {
    await next();
  }
}
