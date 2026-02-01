import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TypeService } from './type.service';
import { AnalyzeTeamRequestDto, AnalyzeTeamResponseDto } from './dto/type.dto';

@ApiTags('types')
@Controller('types')
export class TypeController {
  constructor(private readonly typeService: TypeService) {}

  @Post('analyze')
  @ApiOperation({
    summary: 'Analyze type coverage for a team',
    description:
      'Calculates defensive type multipliers for a team of up to 6 Pokemon. ' +
      'Returns the worst-case vulnerability per type across all team members.',
  })
  @ApiResponse({
    status: 200,
    description: 'Type coverage analysis result',
    type: AnalyzeTeamResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request (empty array, too many IDs, etc.)',
  })
  @ApiResponse({
    status: 404,
    description: 'One or more Pokemon IDs not found',
  })
  analyzeTeam(@Body() dto: AnalyzeTeamRequestDto): AnalyzeTeamResponseDto {
    return this.typeService.analyzeTeam(dto.pokemonIds);
  }
}
