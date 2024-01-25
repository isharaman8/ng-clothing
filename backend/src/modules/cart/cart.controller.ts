// third party imports
import { Controller, Get, InternalServerErrorException, Req } from '@nestjs/common';

// inner imports
import { CRequest } from 'src/interfaces';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private cartSerivce: CartService) {}

  @Get()
  async getUserCart(@Req() request: CRequest) {
    let cart: any;

    try {
      cart = await this.cartSerivce.getUserCart(request.user);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return { cart: this.cartSerivce.getParsedCartResponsePayload(cart) };
  }
}
