// third party imports
import { Module } from '@nestjs/common';

// inner imports
import { SendgridService } from './sendgrid.service';

@Module({
  imports: [],
  providers: [SendgridService],
})
export class SharedModule {}
