FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy all project files from inner AssignmentManagementSystem directory
COPY AssignmentManagementSystem/ .

# Restore dependencies
RUN dotnet restore "AssignmentManagement.API/AssignmentManagement.API.csproj"

# Build & Publish the project
RUN dotnet publish "AssignmentManagement.API/AssignmentManagement.API.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Expose required Port for Render
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "AssignmentManagement.API.dll"]