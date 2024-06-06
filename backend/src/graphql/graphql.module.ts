import { Module } from '@nestjs/common';
import { WebPageResolver } from './webpage.resolver';
import { NodeResolver } from './node.resolver';
import { WebsitesModule } from 'src/websites/websites.module';
import { NodesModule } from 'src/nodes/nodes.module';

@Module({
  imports: [WebsitesModule, NodesModule],
  providers: [WebPageResolver, NodeResolver],
})
export class GraphqlModule {}
