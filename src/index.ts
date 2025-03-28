/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request, env, ctx): Promise<Response> {
		if (request.headers.get('x-client-secret') !== env.AUTH_PASS_STRING) {
			return buildResponse('Failure', 'Missing auth header', 401);
		};

		const body: any = await request.json();

		const timestamp = body?.sentStamp;

		// Get formatted time for Germany (CET/CEST) and India (IST)
		const germanyTime = formatTime(timestamp, "Europe/Berlin");
		const indiaTime = formatTime(timestamp, "Asia/Kolkata");


		const message = {
			"content": `@here **NEW SMS**\n**From**: ${body.from}\n**Time (Germany)**: ${germanyTime}\n**Time (India)**: ${indiaTime}\n\n**Content**:\n${body.text}`,
		}

		const webHookResult = await fetch(env.WEBHOOK_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(message)
		})



		if (webHookResult.status != 204) {
			const errMessage = await webHookResult.text();
			// return new Response(JSON.stringify({ status: 'Failure', message: 'Failed to ' }), { status: 500 });
			return buildResponse('Failure', `SMS forward from ${body.from} failed. ${errMessage}`, 500);
		}

		// return new Response(`Success: fwd sms from ${body.from}`, { status: 200 });
		return buildResponse('Success', `SMS forward from ${body.from} completed.`, 200);


	},
} satisfies ExportedHandler<Env>;

function buildResponse(status: string, message = "Reason unknown", statusCode: number) {
	return new Response(JSON.stringify({ status, message }), {
		status: statusCode,
		headers: { 'Content-Type': 'application/json' }
	});
}
function formatTime(timestamp: number, timeZone: string) {
	return new Intl.DateTimeFormat("en-GB", {
		timeZone,
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	})
		.format(new Date(timestamp));
}