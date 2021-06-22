
# YouTube Task 



## API Reference

#### Search YouTube Data from saved data in reverse order

```http
  GET https://zo4w55y23e.execute-api.us-west-2.amazonaws.com/dev/search/youtube-data/{search_input}/{fetch_limit}/{last_evaluated_key}
```
  
## Deployment

To deploy this project run.

save your .env file in root directory
```bash
   FIRST_YOUTUBE_API_KEY=your_first_youtube_api_key
   SECOND_YOUTUBE_API_KEY=your_second_youtube_api_key
```
configure aws profile
```bash
   export AWS_PROFILE=your-aws-profile
```
install npm modules
```bash
   npm install
```
deploy the project
```bash
   sls deploy --stage dev
```