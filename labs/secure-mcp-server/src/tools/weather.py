from typing import Literal, Dict, Any, Optional
from pydantic import Field
from .base import BaseTool, ToolParameters
import random


class WeatherParams(ToolParameters):
    """Parameters for weather tool."""
    city: str = Field(..., min_length=1, max_length=100)
    units: Literal["celsius", "fahrenheit"] = Field(
        default="celsius",
        description="Temperature units"
    )


class WeatherTool(BaseTool):
    """Get weather information for a city."""
    
    def __init__(self):
        super().__init__(
            name="weather",
            description="Get current weather information for a specified city"
        )
    
    @property
    def parameters_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "city": {
                    "type": "string",
                    "minLength": 1,
                    "maxLength": 100,
                    "description": "City name"
                },
                "units": {
                    "type": "string",
                    "enum": ["celsius", "fahrenheit"],
                    "default": "celsius",
                    "description": "Temperature units"
                }
            },
            "required": ["city"]
        }
    
    def validate_parameters(self, parameters: dict) -> WeatherParams:
        return WeatherParams(**parameters)
    
    def execute(self, params: WeatherParams) -> Dict[str, Any]:
        """Execute the weather lookup.
        
        Note: This is a demo implementation that returns mock data.
        In production, you would integrate with a real weather API.
        """
        city = params.city
        units = params.units
        
        # Mock weather data - in production, call real weather API
        mock_temperature = round(random.uniform(-10, 35), 1)
        conditions = ["sunny", "cloudy", "rainy", "snowy", "partly cloudy"]
        mock_condition = random.choice(conditions)
        
        # Convert temperature if needed
        if units == "fahrenheit":
            mock_temperature = round((mock_temperature * 9/5) + 32, 1)
        
        return {
            "city": city,
            "temperature": mock_temperature,
            "units": units,
            "condition": mock_condition,
            "humidity": random.randint(30, 90),
            "wind_speed": round(random.uniform(0, 25), 1),
            "timestamp": "2026-07-07T12:00:00Z"
        }