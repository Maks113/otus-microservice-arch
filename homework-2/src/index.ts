import express, { Application, Request, Response } from 'express';

const PORT = process.env['PORT'] ?? 8000;
const app: Application = express();

app.get("/", async (req: Request, res: Response): Promise<void> => {
	return res.redirect(301, '/health/');
});

app.get("/health/", async (req: Request, res: Response): Promise<Response> => {
	return res.status(200).send({
		message: "Hello World!",
	});
});

try {
	app.listen(PORT, (): void => {
		console.log(`Connected successfully on port ${PORT}`);
	});
} catch (error: any) {
	console.error(`Error occured: ${error.message}`);
}
