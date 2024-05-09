import requests
token="7004677225:AAEvp1tFSgiIXkQqkCp5mkB6tRScWhcdnAs"

def get_website_data(request):
    url = "https://telegame.vercel.app"
    apiurl="https://api.telegram.org/bot"+ token +"/setWebhook?url=" + url
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        # Process the returned JSON data as needed
        return JsonResponse(data)
    else:
        # Handle the case when the request fails
        return HttpResponse("Failed to retrieve data from the website", status=response.status_code)
