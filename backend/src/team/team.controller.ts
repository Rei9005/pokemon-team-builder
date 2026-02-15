import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiParam,
} from '@nestjs/swagger';
import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// Define authenticated request type
interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

@ApiTags('teams')
@Controller('teams')
export class TeamController {
  constructor(private teamService: TeamService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('jwt')
  @ApiOperation({ summary: 'Create a new team' })
  @ApiResponse({ status: 201, description: 'Team successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request / Team limit reached' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateTeamDto,
  ) {
    return this.teamService.create(req.user.id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('jwt')
  @ApiOperation({ summary: 'Get all teams for the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of user teams' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Request() req: AuthenticatedRequest) {
    const teams = await this.teamService.findAllByUser(req.user.id);
    return { teams };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('jwt')
  @ApiOperation({ summary: 'Get a team by ID' })
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiResponse({ status: 200, description: 'Team details' })
  @ApiResponse({ status: 404, description: 'Team not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.teamService.findOne(id, req.user.id);
  }

  @Get('share/:shareId')
  @ApiOperation({ summary: 'Get a public team by share ID (no auth required)' })
  @ApiParam({ name: 'shareId', description: 'Share ID' })
  @ApiResponse({ status: 200, description: 'Public team details' })
  @ApiResponse({ status: 404, description: 'Team not found' })
  @ApiResponse({ status: 403, description: 'Team is not public' })
  async findByShareId(@Param('shareId') shareId: string) {
    return this.teamService.findByShareId(shareId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('jwt')
  @ApiOperation({ summary: 'Update a team' })
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiResponse({ status: 200, description: 'Team successfully updated' })
  @ApiResponse({ status: 404, description: 'Team not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdateTeamDto,
  ) {
    return this.teamService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('jwt')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a team' })
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiResponse({ status: 204, description: 'Team successfully deleted' })
  @ApiResponse({ status: 404, description: 'Team not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.teamService.remove(id, req.user.id);
  }
}
